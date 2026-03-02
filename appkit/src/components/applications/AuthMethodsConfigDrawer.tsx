'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { adminService } from '@/services/adminService'
import {
  XIcon,
  ShieldCheckIcon,
  MailIcon,
  GlobeIcon,
  CogIcon,
  KeyIcon,
  SmartphoneIcon,
  SaveIcon,
  Loader2Icon,
  LinkIcon,
  MessageCircleIcon,
} from 'lucide-react'

interface AuthMethodsConfigDrawerProps {
  isOpen: boolean
  onClose: () => void
  appId: string
  appName: string
}

interface AuthProvider {
  id: string
  providerName: string
  displayName: string
  isEnabled: boolean
  clientId?: string
  clientSecret?: string
  redirectUri?: string
  scopes?: string[]
  settings?: Record<string, any>
}

const PROVIDER_META: Record<string, { icon: React.ReactNode; color: string }> = {
  'email-password': { icon: <MailIcon className="w-4 h-4" />, color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' },
  'google-oauth': { icon: <GlobeIcon className="w-4 h-4" />, color: 'bg-red-50 dark:bg-red-500/10 text-red-500' },
  'facebook-oauth': { icon: <GlobeIcon className="w-4 h-4" />, color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' },
  'x-oauth': { icon: <GlobeIcon className="w-4 h-4" />, color: 'bg-zinc-50 dark:bg-zinc-500/10 text-zinc-700 dark:text-zinc-300' },
  'microsoft-oauth': { icon: <GlobeIcon className="w-4 h-4" />, color: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600' },
  'line-oauth': { icon: <MessageCircleIcon className="w-4 h-4" />, color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' },
  'github-oauth': { icon: <CogIcon className="w-4 h-4" />, color: 'bg-gray-50 dark:bg-zinc-500/10 text-gray-700 dark:text-zinc-300' },
  'saml-sso': { icon: <ShieldCheckIcon className="w-4 h-4" />, color: 'bg-violet-50 dark:bg-violet-500/10 text-violet-500' },
  'magic-link': { icon: <KeyIcon className="w-4 h-4" />, color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' },
  'sms-otp': { icon: <SmartphoneIcon className="w-4 h-4" />, color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-500' },
  'whatsapp-otp': { icon: <MessageCircleIcon className="w-4 h-4" />, color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' },
}

const FALLBACK_PROVIDERS: AuthProvider[] = [
  { id: 'default-email', providerName: 'email-password', displayName: 'Email & Password', isEnabled: true, settings: {} },
  { id: 'default-saml', providerName: 'saml-sso', displayName: 'SAML / SSO', isEnabled: false, settings: {} },
  { id: 'default-magic', providerName: 'magic-link', displayName: 'Magic Link', isEnabled: false, settings: {} },
  { id: 'default-sms', providerName: 'sms-otp', displayName: 'SMS OTP', isEnabled: false, settings: {} },
  { id: 'default-whatsapp', providerName: 'whatsapp-otp', displayName: 'WhatsApp OTP', isEnabled: false, settings: {} },
  { id: 'default-google', providerName: 'google-oauth', displayName: 'Google OAuth', isEnabled: false },
  { id: 'default-facebook', providerName: 'facebook-oauth', displayName: 'Facebook OAuth', isEnabled: false },
  { id: 'default-x', providerName: 'x-oauth', displayName: 'X OAuth', isEnabled: false },
  { id: 'default-microsoft', providerName: 'microsoft-oauth', displayName: 'Microsoft OAuth', isEnabled: false },
  { id: 'default-line', providerName: 'line-oauth', displayName: 'LINE OAuth', isEnabled: false },
  { id: 'default-github', providerName: 'github-oauth', displayName: 'GitHub OAuth', isEnabled: false },
]

const PROVIDER_GROUP: Record<string, 'social login' | 'password less' | 'general'> = {
  'email-password': 'general',
  'saml-sso': 'general',
  'magic-link': 'password less',
  'sms-otp': 'password less',
  'whatsapp-otp': 'password less',
  'google-oauth': 'social login',
  'github-oauth': 'social login',
  'facebook-oauth': 'social login',
  'x-oauth': 'social login',
  'microsoft-oauth': 'social login',
  'line-oauth': 'social login',
}

const PROVIDER_GUIDES: Record<string, string[]> = {
  'email-password': [
    'Enable strong password rules and account lockout for brute-force protection.',
    'Always hash passwords server-side and never log raw credentials.',
    'Use email verification before granting full account access.',
  ],
  'saml-sso': [
    'Match ACS URL and Entity ID exactly with your identity provider configuration.',
    'Rotate signing certificates safely and support overlap during rollover.',
    'Validate audience, issuer, and assertion expiration on every login.',
  ],
  'magic-link': [
    'Use short-lived, one-time tokens and invalidate tokens after first use.',
    'Bind token usage to expected app/client context where possible.',
    'Throttle resend attempts to reduce abuse and email spam.',
  ],
  'sms-otp': [
    'Keep OTP expiration short and limit retry attempts per challenge.',
    'Use rate limits per phone number and IP to prevent abuse.',
    'Prefer OTP as second factor; avoid SMS-only for high-risk flows.',
  ],
  'whatsapp-otp': [
    'Use approved WhatsApp templates and verify sender business identity.',
    'Expire OTP quickly and enforce retry + resend cooldowns.',
    'Fallback to alternate channel if delivery status is delayed.',
  ],
  'google-oauth': [
    'Register exact redirect URIs (including scheme, host, and trailing slash).',
    'Use PKCE for public clients and keep client secrets on backend only.',
    'Request minimal scopes first and add sensitive scopes only when needed.',
  ],
  'github-oauth': [
    'Ensure callback URL matches app settings exactly.',
    'Store client secret only in secure server environment variables.',
    'Handle denied-consent responses and show retry path to users.',
  ],
  'facebook-oauth': [
    'Whitelist exact redirect URIs in Facebook app settings.',
    'Complete app review before requesting restricted profile permissions.',
    'Enable strict mode for redirect URI validation in production.',
  ],
  'x-oauth': [
    'Configure callback URL exactly and use OAuth 2.0 with PKCE when available.',
    'Request the smallest scope set needed for your feature.',
    'Handle token refresh and revoked-consent errors gracefully.',
  ],
  'microsoft-oauth': [
    'Choose correct tenant model (single-tenant vs multi-tenant) early.',
    'Register platform-specific redirect URIs for web and mobile separately.',
    'Validate issuer and audience from Microsoft tokens on backend.',
  ],
  'line-oauth': [
    'Set callback URL exactly in LINE Developers console.',
    'Use state parameter and verify it to prevent CSRF attacks.',
    'Request profile/email scopes only when needed by the app.',
  ],
}

type FieldType = 'text' | 'password' | 'url' | 'number' | 'textarea' | 'boolean' | 'csv'

interface ProviderField {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  requiredWhenEnabled?: boolean
  min?: number
}

const COMMON_OAUTH_FIELDS: ProviderField[] = [
  { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Enter OAuth client id', requiredWhenEnabled: true },
  { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Enter OAuth client secret', requiredWhenEnabled: true },
  { key: 'redirectUri', label: 'Redirect URI', type: 'url', placeholder: 'https://app.example.com/auth/callback', requiredWhenEnabled: true },
  { key: 'scopes', label: 'Scopes (comma separated)', type: 'csv', placeholder: 'openid, profile, email', requiredWhenEnabled: true },
  { key: 'settings.oauth.usePkce', label: 'Use PKCE', type: 'boolean' },
]

const PROVIDER_FIELDS: Record<string, ProviderField[]> = {
  'email-password': [
    { key: 'settings.passwordPolicy.minLength', label: 'Minimum Password Length', type: 'number', min: 8, requiredWhenEnabled: true },
    { key: 'settings.passwordPolicy.requireUppercase', label: 'Require Uppercase', type: 'boolean' },
    { key: 'settings.passwordPolicy.requireLowercase', label: 'Require Lowercase', type: 'boolean' },
    { key: 'settings.passwordPolicy.requireNumber', label: 'Require Number', type: 'boolean' },
    { key: 'settings.passwordPolicy.requireSpecial', label: 'Require Special Character', type: 'boolean' },
    { key: 'settings.security.requireEmailVerification', label: 'Require Email Verification', type: 'boolean' },
    { key: 'settings.security.maxFailedAttempts', label: 'Max Failed Attempts', type: 'number', min: 1, requiredWhenEnabled: true },
    { key: 'settings.security.lockoutMinutes', label: 'Lockout Minutes', type: 'number', min: 1, requiredWhenEnabled: true },
  ],
  'saml-sso': [
    { key: 'settings.saml.entityId', label: 'Entity ID', type: 'text', requiredWhenEnabled: true },
    { key: 'settings.saml.ssoUrl', label: 'SSO URL', type: 'url', requiredWhenEnabled: true },
    { key: 'settings.saml.certificate', label: 'X.509 Certificate', type: 'textarea', requiredWhenEnabled: true },
  ],
  'magic-link': [
    { key: 'settings.magicLink.expiryMinutes', label: 'Link Expiry (minutes)', type: 'number', min: 1, requiredWhenEnabled: true },
    { key: 'settings.magicLink.maxAttempts', label: 'Max Attempts Per Link', type: 'number', min: 1, requiredWhenEnabled: true },
    { key: 'settings.magicLink.resendCooldownSeconds', label: 'Resend Cooldown (seconds)', type: 'number', min: 0, requiredWhenEnabled: true },
    { key: 'settings.magicLink.rateLimitPerHour', label: 'Rate Limit Per Hour', type: 'number', min: 1, requiredWhenEnabled: true },
  ],
  'sms-otp': [
    { key: 'settings.otp.expirySeconds', label: 'OTP Expiry (seconds)', type: 'number', min: 30, requiredWhenEnabled: true },
    { key: 'settings.otp.codeLength', label: 'OTP Length', type: 'number', min: 4, requiredWhenEnabled: true },
    { key: 'settings.otp.maxAttempts', label: 'Max Verify Attempts', type: 'number', min: 1, requiredWhenEnabled: true },
    { key: 'settings.otp.resendCooldownSeconds', label: 'Resend Cooldown (seconds)', type: 'number', min: 0, requiredWhenEnabled: true },
    { key: 'settings.otp.rateLimitPerHour', label: 'Rate Limit Per Hour', type: 'number', min: 1, requiredWhenEnabled: true },
  ],
  'whatsapp-otp': [
    { key: 'settings.otp.expirySeconds', label: 'OTP Expiry (seconds)', type: 'number', min: 30, requiredWhenEnabled: true },
    { key: 'settings.otp.codeLength', label: 'OTP Length', type: 'number', min: 4, requiredWhenEnabled: true },
    { key: 'settings.otp.maxAttempts', label: 'Max Verify Attempts', type: 'number', min: 1, requiredWhenEnabled: true },
    { key: 'settings.otp.resendCooldownSeconds', label: 'Resend Cooldown (seconds)', type: 'number', min: 0, requiredWhenEnabled: true },
    { key: 'settings.otp.rateLimitPerHour', label: 'Rate Limit Per Hour', type: 'number', min: 1, requiredWhenEnabled: true },
  ],
  'google-oauth': COMMON_OAUTH_FIELDS,
  'github-oauth': COMMON_OAUTH_FIELDS,
  'facebook-oauth': COMMON_OAUTH_FIELDS,
  'x-oauth': COMMON_OAUTH_FIELDS,
  'microsoft-oauth': COMMON_OAUTH_FIELDS,
  'line-oauth': COMMON_OAUTH_FIELDS,
}

export default function AuthMethodsConfigDrawer({ isOpen, onClose, appId, appName }: AuthMethodsConfigDrawerProps) {
  const [providers, setProviders] = useState<AuthProvider[]>(FALLBACK_PROVIDERS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    if (isOpen && appId) loadData()
  }, [isOpen, appId])

  const mergeWithFallbacks = (apiProviders: AuthProvider[]): AuthProvider[] => {
    if (!apiProviders || apiProviders.length === 0) return FALLBACK_PROVIDERS
    const map = new Map(apiProviders.map((p) => [p.providerName, p]))
    return FALLBACK_PROVIDERS.map((fallback) => {
      const fromApi = map.get(fallback.providerName)
      if (!fromApi) return fallback
      return {
        ...fallback,
        ...fromApi,
        settings: {
          ...(fallback.settings || {}),
          ...(fromApi.settings || {}),
        },
      }
    })
  }

  const getNestedValue = (obj: Record<string, any> | undefined, path: string) => {
    if (!obj) return undefined
    return path.split('.').reduce<any>((acc, part) => (acc && part in acc ? acc[part] : undefined), obj)
  }

  const setNestedValue = (obj: Record<string, any>, path: string, value: any) => {
    const parts = path.split('.')
    let cursor: any = obj
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i]
      cursor[key] = cursor[key] && typeof cursor[key] === 'object' ? cursor[key] : {}
      cursor = cursor[key]
    }
    cursor[parts[parts.length - 1]] = value
  }

  const getFieldValue = (provider: AuthProvider, field: ProviderField) => {
    if (field.key === 'scopes') {
      return (provider.scopes || []).join(', ')
    }
    if (field.key.startsWith('settings.')) {
      return getNestedValue(provider.settings, field.key.replace('settings.', ''))
    }
    return (provider as any)[field.key]
  }

  const updateProviderField = (providerName: string, field: ProviderField, rawValue: any) => {
    setProviders((prev) =>
      prev.map((provider) => {
        if (provider.providerName !== providerName) return provider

        if (field.key === 'scopes') {
          const scopes = String(rawValue)
            .split(',')
            .map((scope) => scope.trim())
            .filter(Boolean)
          return { ...provider, scopes }
        }

        if (field.key.startsWith('settings.')) {
          const nextSettings = { ...(provider.settings || {}) }
          setNestedValue(nextSettings, field.key.replace('settings.', ''), rawValue)
          return { ...provider, settings: nextSettings }
        }

        return { ...provider, [field.key]: rawValue }
      })
    )
  }

  const validateEnabledProviders = (): string | null => {
    for (const provider of providers) {
      if (!provider.isEnabled) continue
      const fields = PROVIDER_FIELDS[provider.providerName] || []
      for (const field of fields) {
        if (!field.requiredWhenEnabled) continue
        const value = getFieldValue(provider, field)
        if (field.type === 'number') {
          const parsed = Number(value)
          if (!Number.isFinite(parsed) || parsed < (field.min ?? 0)) {
            return `${provider.displayName}: ${field.label} is required`
          }
          continue
        }
        if (typeof value !== 'string' || !value.trim()) {
          return `${provider.displayName}: ${field.label} is required`
        }
      }
    }
    return null
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await adminService.getAppConfigOverride(appId, 'auth')
      const apiConfig = Array.isArray(res.config) ? res.config : []
      setProviders(mergeWithFallbacks(apiConfig))
    } catch (err) {
      console.error('Failed to load app auth config:', err)
      setProviders(FALLBACK_PROVIDERS)
    } finally {
      setLoading(false)
    }
  }

  const toggleProvider = (providerName: string) => {
    setProviders(prev => prev.map(p => p.providerName === providerName ? { ...p, isEnabled: !p.isEnabled } : p))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const validationError = validateEnabledProviders()
      if (validationError) {
        setSaveMessage(validationError)
        setTimeout(() => setSaveMessage(''), 5000)
        return
      }
      await adminService.saveAppConfig(appId, 'auth', providers)
      setSaveMessage('Saved!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (err) {
      console.error('Failed to save:', err)
      setSaveMessage('Failed to save')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-4 right-4 bottom-4 w-full max-w-lg bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 dark:border-zinc-800/80">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Auth Methods Config</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{appName}</p>
          </div>
          <button onClick={onClose} title="Close auth methods config" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-zinc-500"><XIcon className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2Icon className="w-5 h-5 text-blue-500 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Authentication Methods</h3>
                </div>
                {(['social login', 'password less', 'general'] as const).map((group) => {
                  const groupProviders = providers.filter((p) => (PROVIDER_GROUP[p.providerName] || 'general') === group)
                  if (groupProviders.length === 0) return null

                  return (
                    <div key={group} className="space-y-3">
                      <div className="px-1">
                        <span className="inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300">
                          {group}
                        </span>
                      </div>
                      {groupProviders.map(p => {
                        const meta = PROVIDER_META[p.providerName]
                        const fields = PROVIDER_FIELDS[p.providerName] || []

                        return (
                          <div key={p.providerName} className="p-4 rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-9 h-9 rounded-lg ${meta?.color || 'bg-gray-50 text-gray-500'} flex items-center justify-center shadow-sm`}>{meta?.icon || <CogIcon className="w-5 h-5" />}</div>
                                <div>
                                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{p.displayName}</span>
                                  <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-0.5">App-specific authentication method configuration</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" title={`${p.displayName} enabled`} className="sr-only peer" checked={p.isEnabled} onChange={() => toggleProvider(p.providerName)} />
                                  <div className="w-10 h-5 bg-gray-200 dark:bg-zinc-700 peer-checked:bg-blue-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                                </label>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800/50 space-y-3">
                              <div className="p-3 rounded-lg border border-blue-200/60 dark:border-blue-500/20 bg-blue-50/30 dark:bg-blue-500/5">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <LinkIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                  <p className="text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                                    {p.displayName} setup guide
                                  </p>
                                </div>
                                <ul className="list-disc pl-4 space-y-1 text-[11px] text-blue-900/90 dark:text-blue-200/90">
                                  {(PROVIDER_GUIDES[p.providerName] || [
                                    'Use exact callback/redirect URL matching in provider settings.',
                                    'Keep secrets on backend only and use PKCE for public clients.',
                                    'Handle denied consent and token errors with clear retry UX.',
                                  ]).map((tip) => (
                                    <li key={tip}>{tip}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                {fields.map((field) => {
                                  const fieldValue = getFieldValue(p, field)
                                  const label = field.requiredWhenEnabled ? `${field.label} *` : field.label

                                  if (field.type === 'boolean') {
                                    return (
                                      <label key={field.key} className="inline-flex items-center gap-2 text-xs text-gray-700 dark:text-zinc-300">
                                        <input
                                          type="checkbox"
                                          checked={Boolean(fieldValue)}
                                          onChange={(e) => updateProviderField(p.providerName, field, e.target.checked)}
                                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        {label}
                                      </label>
                                    )
                                  }

                                  if (field.type === 'textarea') {
                                    return (
                                      <div key={field.key}>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">{label}</label>
                                        <textarea
                                          rows={4}
                                          value={typeof fieldValue === 'string' ? fieldValue : ''}
                                          placeholder={field.placeholder}
                                          onChange={(e) => updateProviderField(p.providerName, field, e.target.value)}
                                          className="w-full px-3 py-1.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                      </div>
                                    )
                                  }

                                  return (
                                    <div key={field.key}>
                                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">{label}</label>
                                      <input
                                        type={field.type === 'csv' ? 'text' : field.type}
                                        min={field.type === 'number' ? field.min : undefined}
                                        value={
                                          field.type === 'number'
                                            ? (fieldValue ?? '')
                                            : (typeof fieldValue === 'string' ? fieldValue : '')
                                        }
                                        placeholder={field.placeholder}
                                        onChange={(e) => {
                                          const nextValue = field.type === 'number'
                                            ? (e.target.value === '' ? '' : Number(e.target.value))
                                            : e.target.value
                                          updateProviderField(p.providerName, field, nextValue)
                                        }}
                                        className="w-full px-3 py-1.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                      />
                                    </div>
                                  )
                                })}
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <div />
                                <span className="text-[10px] text-gray-400">
                                  {p.isEnabled ? 'Active' : 'Disabled'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="p-6 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-end space-x-2">
            {saveMessage && <span className={`text-sm font-medium mr-2 ${saveMessage === 'Saved!' ? 'text-emerald-600' : 'text-red-500'}`}>{saveMessage}</span>}
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
              {saving ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> : <SaveIcon className="w-4 h-4 mr-2" />}
              Save
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
