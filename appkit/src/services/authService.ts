// Authentication Service — httpOnly cookie + in-memory token cache
import { API_BASE_URL } from './apiConfig'

export interface LoginCredentials {
  email: string
  password: string
  clientId?: string
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  permissions: string[]
  isSuperAdmin?: boolean
}

export interface AuthResponse {
  token: string
  user: AuthUser
  redirectTo?: string | null
}

class AuthService {
  /** In-memory token — gone on page refresh, repopulated by initSession() via cookie. */
  private _token: string | null = null
  /** In-memory user cache. */
  private _user: AuthUser | null = null
  /** Deduplicates concurrent initSession() calls. */
  private _initPromise: Promise<AuthUser | null> | null = null

  // ── Low-level fetch ──────────────────────────────────────────────────────

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }
    if (this._token) {
      headers['Authorization'] = `Bearer ${this._token}`
    }

    const response = await fetch(url, {
      credentials: 'include', // always send httpOnly cookie
      ...options,
      headers,
    })

    if (response.status === 401) {
      this._token = null
      this._user = null
      const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login'
      const isAuthEndpoint = endpoint.includes('/auth/')
      if (!isLoginPage && !isAuthEndpoint && typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      const text = await response.text()
      let msg = `HTTP error ${response.status}`
      try { msg = JSON.parse(text)?.error || msg } catch { /* ignore */ }
      throw new Error(msg)
    }

    const text = await response.text()
    if (!text) return {} as T
    return JSON.parse(text)
  }

  // ── Session init (called on every page load) ─────────────────────────────

  /**
   * Restore session from the httpOnly cookie by calling /me.
   * Deduplicated so concurrent calls share one request.
   */
  async initSession(): Promise<AuthUser | null> {
    if (this._user) return this._user
    if (this._initPromise) return this._initPromise

    this._initPromise = (async () => {
      try {
        const result = await this.request<any>('/v1/admin/auth/me')
        if (result?.id) {
          this._user = {
            id: result.id,
            email: result.email,
            firstName: result.firstName || result.name || '',
            lastName: result.lastName || '',
            role: result.role || 'admin',
            permissions: result.permissions || [],
            isSuperAdmin: result.isSuperAdmin || false,
          }
          return this._user
        }
      } catch {
        // 401 or network error — not authenticated
      } finally {
        this._initPromise = null
      }
      return null
    })()

    return this._initPromise
  }

  // ── Auth actions ──────────────────────────────────────────────────────────

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/v1/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        clientId: credentials.clientId,
      }),
    })

    // Cache in memory only — cookie is set by the server
    this._token = response.token
    this._user = response.user
    return response
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>('/v1/admin/auth/logout', { method: 'POST' })
    } catch {
      // proceed regardless
    }
    this._token = null
    this._user = null
  }

  // ── Accessors ─────────────────────────────────────────────────────────────

  /** Returns the in-memory token (null after page refresh until initSession resolves). */
  getToken(): string | null {
    return this._token
  }

  /** Returns cached user synchronously — null until initSession() completes. */
  getUser(): AuthUser | null {
    return this._user
  }

  /** True when either a memory token or a cached user is present. */
  isAuthenticated(): boolean {
    return !!(this._token || this._user)
  }
}

export const authService = new AuthService()
