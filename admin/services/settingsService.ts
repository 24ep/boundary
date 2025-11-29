export interface GASettings {
  measurementId: string
}

export interface SMTPSettings {
  host: string
  port: number
  user: string
  pass: string
  from: string
}

export interface SSOSettings {
  provider: 'none' | 'google' | 'auth0' | 'oidc'
  clientId: string
  clientSecret: string
  issuerUrl: string
}

export interface BrandingSettings {
  adminAppName?: string
  mobileAppName?: string
  logoUrl?: string
  iconUrl?: string
  updatedAt?: string
  updatedBy?: string
}

export interface IntegrationsSettings {
  mobileGA: GASettings
  smtpMobile: SMTPSettings
  smtpAdmin: SMTPSettings
  ssoMobile: SSOSettings
  ssoAdmin: SSOSettings
  push?: {
    fcmServerKey?: string
    apnsKeyId?: string
    apnsTeamId?: string
    apnsKeyP8?: string
    apnsTopic?: string
  }
  deepLinks?: {
    iosAssociatedDomains?: string[]
    androidAppLinks?: string[]
    urlSchemes?: string[]
    adminRedirectUris?: string[]
  }
  monitoring?: {
    sentryDsn?: string
    environment?: string
    tracesSampleRate?: number
    profilesSampleRate?: number
  }
  featureFlags?: Record<string, boolean>
  endpoints?: {
    apiBaseUrl?: string
    websocketUrl?: string
    cdnBaseUrl?: string
  }
  auth?: {
    jwtTtlMinutes?: number
    refreshTtlDays?: number
    allowedProviders?: string[]
    redirectUris?: string[]
  }
  security?: {
    recaptchaSiteKey?: string
    recaptchaSecret?: string
    rateLimitRps?: number
    corsOrigins?: string[]
    cspConnectSrc?: string[]
  }
  storage?: {
    bucket?: string
    region?: string
    accessKeyId?: string
    secretAccessKey?: string
    cdnBaseUrl?: string
    maxUploadMb?: number
  }
  webAnalytics?: {
    gaMeasurementId?: string
    consentMode?: 'auto' | 'basic' | 'disabled'
  }
  branding?: {
    logoUrl?: string
    faviconUrl?: string
    primaryColor?: string
    termsUrl?: string
    privacyUrl?: string
    supportEmail?: string
  }
  localization?: {
    defaultLocale?: string
    availableLocales?: string[]
    fallbackBehavior?: 'nearest' | 'default'
  }
  payments?: {
    stripePublishableKey?: string
    stripeSecretKey?: string
    webhookSigningSecret?: string
  }
}

const STORAGE_KEY = 'bondarys.integrations.settings.v1'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('auth_token')
  } catch {
    return null
  }
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const settingsService = {
  async getIntegrations(): Promise<IntegrationsSettings | null> {
    // Try backend first
    try {
      const token = getAuthToken()
      if (token) {
        const res = await fetch(`${API_BASE}/api/settings/integrations`, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          const settings = (data?.integrations || null) as IntegrationsSettings | null
          if (settings) {
            const storage = getStorage()
            storage?.setItem(STORAGE_KEY, JSON.stringify(settings))
            return settings
          }
        }
      }
    } catch {}

    // Fallback to local
    const storage = getStorage()
    const raw = storage?.getItem(STORAGE_KEY)
    if (!raw) return null
    try { return JSON.parse(raw) as IntegrationsSettings } catch { return null }
  },

  async saveIntegrations(settings: IntegrationsSettings): Promise<void> {
    // Try backend first
    try {
      const token = getAuthToken()
      if (token) {
        const res = await fetch(`${API_BASE}/api/settings/integrations`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(settings)
        })
        if (res.ok) {
          const storage = getStorage()
          storage?.setItem(STORAGE_KEY, JSON.stringify(settings))
          return
        }
      }
    } catch {}

    // Fallback to local
    const storage = getStorage()
    storage?.setItem(STORAGE_KEY, JSON.stringify(settings))
  }
  ,

  async getBranding(apiBase?: string): Promise<BrandingSettings | null> {
    try {
      const base = apiBase || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const res = await fetch(`${base}/api/settings/branding`, { credentials: 'include' })
      if (!res.ok) return null
      const data = await res.json()
      return (data?.branding as BrandingSettings) || null
    } catch {
      return null
    }
  },

  async saveBranding(branding: BrandingSettings, apiBase?: string): Promise<BrandingSettings | null> {
    try {
      const base = apiBase || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
      const res = await fetch(`${base}/api/settings/branding`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(branding)
      })
      if (!res.ok) return null
      const data = await res.json()
      return (data?.branding as BrandingSettings) || null
    } catch {
      return null
    }
  }
}

export type { IntegrationsSettings as IntegrationsSettingsType }


