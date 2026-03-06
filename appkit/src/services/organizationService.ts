import { API_BASE_URL } from './apiConfig'
import { authService } from './authService'

export interface OrgMembership {
  id: string
  name: string
  slug: string
  description: string | null
  isActive: boolean
  role: string
  isPrimary: boolean
}

export interface OrgInvite {
  id: string
  code: string
  role: string
  maxUses: number | null
  useCount: number
  usesRemaining: number | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = authService.getToken()
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const organizationService = {
  getMyOrganizations(): Promise<{ organizations: OrgMembership[]; hasOrganization: boolean }> {
    return apiFetch('/v1/admin/auth/me/organization')
  },

  createOrganization(data: { name: string; slug?: string; description?: string }): Promise<{ organization: OrgMembership }> {
    return apiFetch('/v1/admin/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  validateInvite(code: string): Promise<{ valid: boolean; organization: { id: string; name: string; slug: string }; role: string; inviteId: string }> {
    return apiFetch('/v1/admin/invites/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  },

  acceptInvite(code: string): Promise<{ success: boolean; organization: { id: string; name: string; slug: string } }> {
    return apiFetch('/v1/admin/invites/accept', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  },

  listInvites(): Promise<{ invites: OrgInvite[] }> {
    return apiFetch('/v1/admin/invites')
  },

  createInvite(data: { role?: string; maxUses?: number; expiresAt?: string }): Promise<{ invite: OrgInvite }> {
    return apiFetch('/v1/admin/invites', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}
