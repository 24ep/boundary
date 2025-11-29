'use client'

import { useEffect, useState } from 'react'
import { settingsService, type IntegrationsSettings as IntegrationsSettingsType } from '../services/settingsService'

interface IntegrationsSettingsProps {
  activeSub?:
    | 'integrations'
    | 'auth'
    | 'endpoints'
    | 'monitoring'
    | 'push'
    | 'storage'
    | 'analytics'
    | 'payments'
    | 'smtp'
    | 'localization'
    | 'security'
}

export function IntegrationsSettings({ activeSub }: IntegrationsSettingsProps) {
  const [values, setValues] = useState<IntegrationsSettingsType>({
    mobileGA: { measurementId: '' },
    smtpMobile: { host: '', port: 587, user: '', pass: '', from: '' },
    smtpAdmin: { host: '', port: 587, user: '', pass: '', from: '' },
    ssoMobile: { provider: 'none', clientId: '', clientSecret: '', issuerUrl: '' },
    ssoAdmin: { provider: 'none', clientId: '', clientSecret: '', issuerUrl: '' },
    push: { fcmServerKey: '', apnsKeyId: '', apnsTeamId: '', apnsKeyP8: '', apnsTopic: '' },
    deepLinks: { iosAssociatedDomains: [], androidAppLinks: [], urlSchemes: [], adminRedirectUris: [] },
    monitoring: { sentryDsn: '', environment: '', tracesSampleRate: 1, profilesSampleRate: 1 },
    featureFlags: {},
    endpoints: { apiBaseUrl: '', websocketUrl: '', cdnBaseUrl: '' },
    auth: { jwtTtlMinutes: 60, refreshTtlDays: 30, allowedProviders: [], redirectUris: [] },
    security: { recaptchaSiteKey: '', recaptchaSecret: '', rateLimitRps: 100, corsOrigins: [], cspConnectSrc: [] },
    storage: { bucket: '', region: '', accessKeyId: '', secretAccessKey: '', cdnBaseUrl: '', maxUploadMb: 25 },
    webAnalytics: { gaMeasurementId: '', consentMode: 'basic' },
    branding: { logoUrl: '', faviconUrl: '', primaryColor: '#FA7272', termsUrl: '', privacyUrl: '', supportEmail: '' },
    localization: { defaultLocale: 'en', availableLocales: ['en'], fallbackBehavior: 'default' },
    payments: { stripePublishableKey: '', stripeSecretKey: '', webhookSigningSecret: '' }
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      const existing = await settingsService.getIntegrations()
      if (existing) setValues(existing)
    }
    load()
  }, [])

  const update = (path: string, val: any) => {
    setValues(prev => {
      const clone: any = { ...prev }
      const parts = path.split('.')
      let ref: any = clone
      for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]]
      ref[parts[parts.length - 1]] = val
      return clone
    })
  }

  const updateArray = (path: string, list: string) => {
    const arr = list
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
    update(path, arr)
  }

  const onSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await settingsService.saveIntegrations(values)
      setSaved(true)
    } finally {
      setSaving(false)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  const show = (key: string) => !activeSub || activeSub === key

  return (
    <div className="space-y-6">
      {show('analytics') && (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mobile App Analytics (GA4)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Measurement ID</label>
            <input
              className="form-input"
              placeholder="G-XXXXXXXXXX"
              value={values.mobileGA.measurementId}
              onChange={e => update('mobileGA.measurementId', e.target.value)}
            />
          </div>
        </div>
      </div>
      )}

      {show('push') && (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Push Notifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="form-label">FCM Server Key</label>
            <input className="form-input" value={values.push?.fcmServerKey || ''} onChange={e => update('push.fcmServerKey', e.target.value)} />
          </div>
          <div>
            <label className="form-label">APNs Key ID</label>
            <input className="form-input" value={values.push?.apnsKeyId || ''} onChange={e => update('push.apnsKeyId', e.target.value)} />
          </div>
          <div>
            <label className="form-label">APNs Team ID</label>
            <input className="form-input" value={values.push?.apnsTeamId || ''} onChange={e => update('push.apnsTeamId', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="form-label">APNs .p8 Key (paste)</label>
            <textarea rows={4} className="form-input" value={values.push?.apnsKeyP8 || ''} onChange={e => update('push.apnsKeyP8', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="form-label">APNs Topic (Bundle ID)</label>
            <input className="form-input" value={values.push?.apnsTopic || ''} onChange={e => update('push.apnsTopic', e.target.value)} />
          </div>
        </div>
      </div>
      )}

      {show('smtp') && (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SMTP - Mobile Application</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Host</label>
            <input className="form-input" value={values.smtpMobile.host} onChange={e => update('smtpMobile.host', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Port</label>
            <input type="number" className="form-input" value={values.smtpMobile.port} onChange={e => update('smtpMobile.port', Number(e.target.value))} />
          </div>
          <div>
            <label className="form-label">User</label>
            <input className="form-input" value={values.smtpMobile.user} onChange={e => update('smtpMobile.user', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input type="password" className="form-input" value={values.smtpMobile.pass} onChange={e => update('smtpMobile.pass', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="form-label">From Email</label>
            <input className="form-input" value={values.smtpMobile.from} onChange={e => update('smtpMobile.from', e.target.value)} />
          </div>
        </div>
      </div>
      )}

      {show('smtp') && (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SMTP - Admin Console</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Host</label>
            <input className="form-input" value={values.smtpAdmin.host} onChange={e => update('smtpAdmin.host', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Port</label>
            <input type="number" className="form-input" value={values.smtpAdmin.port} onChange={e => update('smtpAdmin.port', Number(e.target.value))} />
          </div>
          <div>
            <label className="form-label">User</label>
            <input className="form-input" value={values.smtpAdmin.user} onChange={e => update('smtpAdmin.user', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input type="password" className="form-input" value={values.smtpAdmin.pass} onChange={e => update('smtpAdmin.pass', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="form-label">From Email</label>
            <input className="form-input" value={values.smtpAdmin.from} onChange={e => update('smtpAdmin.from', e.target.value)} />
          </div>
        </div>
      </div>
      )}

      {show('auth') && (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SSO - Mobile Application</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Provider</label>
            <select className="form-select" value={values.ssoMobile.provider} onChange={e => update('ssoMobile.provider', e.target.value)}>
              <option value="none">None</option>
              <option value="google">Google</option>
              <option value="auth0">Auth0</option>
              <option value="oidc">OIDC</option>
            </select>
          </div>
          <div>
            <label className="form-label">Issuer URL</label>
            <input className="form-input" value={values.ssoMobile.issuerUrl} onChange={e => update('ssoMobile.issuerUrl', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Client ID</label>
            <input className="form-input" value={values.ssoMobile.clientId} onChange={e => update('ssoMobile.clientId', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Client Secret</label>
            <input type="password" className="form-input" value={values.ssoMobile.clientSecret} onChange={e => update('ssoMobile.clientSecret', e.target.value)} />
          </div>
        </div>
      </div>
      )}

      {show('auth') && (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SSO - Admin Console</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Provider</label>
            <select className="form-select" value={values.ssoAdmin.provider} onChange={e => update('ssoAdmin.provider', e.target.value)}>
              <option value="none">None</option>
              <option value="google">Google</option>
              <option value="auth0">Auth0</option>
              <option value="oidc">OIDC</option>
            </select>
          </div>
          <div>
            <label className="form-label">Issuer URL</label>
            <input className="form-input" value={values.ssoAdmin.issuerUrl} onChange={e => update('ssoAdmin.issuerUrl', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Client ID</label>
            <input className="form-input" value={values.ssoAdmin.clientId} onChange={e => update('ssoAdmin.clientId', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Client Secret</label>
            <input type="password" className="form-input" value={values.ssoAdmin.clientSecret} onChange={e => update('ssoAdmin.clientSecret', e.target.value)} />
          </div>
        </div>
      </div>
      )}

      {show('endpoints') && (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deep Links & App Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">iOS Associated Domains (one per line)</label>
            <textarea rows={4} className="form-input" value={(values.deepLinks?.iosAssociatedDomains || []).join('\n')} onChange={e => updateArray('deepLinks.iosAssociatedDomains', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Android App Links (one per line)</label>
            <textarea rows={4} className="form-input" value={(values.deepLinks?.androidAppLinks || []).join('\n')} onChange={e => updateArray('deepLinks.androidAppLinks', e.target.value)} />
          </div>
          <div>
            <label className="form-label">URL Schemes (one per line)</label>
            <textarea rows={4} className="form-input" value={(values.deepLinks?.urlSchemes || []).join('\n')} onChange={e => updateArray('deepLinks.urlSchemes', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Admin Redirect URIs (one per line)</label>
            <textarea rows={4} className="form-input" value={(values.deepLinks?.adminRedirectUris || []).join('\n')} onChange={e => updateArray('deepLinks.adminRedirectUris', e.target.value)} />
          </div>
        </div>
      </div>
      )}

      {show('monitoring') && (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Monitoring</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Sentry DSN</label>
            <input className="form-input" value={values.monitoring?.sentryDsn || ''} onChange={e => update('monitoring.sentryDsn', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Environment</label>
            <input className="form-input" value={values.monitoring?.environment || ''} onChange={e => update('monitoring.environment', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Traces Sample Rate</label>
            <input type="number" step="0.01" className="form-input" value={values.monitoring?.tracesSampleRate ?? 1} onChange={e => update('monitoring.tracesSampleRate', Number(e.target.value))} />
          </div>
          <div>
            <label className="form-label">Profiles Sample Rate</label>
            <input type="number" step="0.01" className="form-input" value={values.monitoring?.profilesSampleRate ?? 1} onChange={e => update('monitoring.profilesSampleRate', Number(e.target.value))} />
          </div>
        </div>
      </div>
      )}

      {show('endpoints') && (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Environment Endpoints</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">API Base URL</label>
            <input className="form-input" value={values.endpoints?.apiBaseUrl || ''} onChange={e => update('endpoints.apiBaseUrl', e.target.value)} />
          </div>
          <div>
            <label className="form-label">WebSocket URL</label>
            <input className="form-input" value={values.endpoints?.websocketUrl || ''} onChange={e => update('endpoints.websocketUrl', e.target.value)} />
          </div>
          <div>
            <label className="form-label">CDN Base URL</label>
            <input className="form-input" value={values.endpoints?.cdnBaseUrl || ''} onChange={e => update('endpoints.cdnBaseUrl', e.target.value)} />
          </div>
        </div>
      </div>
      )}

      {show('auth') && (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication Defaults</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">JWT TTL (minutes)</label>
            <input type="number" className="form-input" value={values.auth?.jwtTtlMinutes ?? 60} onChange={e => update('auth.jwtTtlMinutes', Number(e.target.value))} />
          </div>
          <div>
            <label className="form-label">Refresh TTL (days)</label>
            <input type="number" className="form-input" value={values.auth?.refreshTtlDays ?? 30} onChange={e => update('auth.refreshTtlDays', Number(e.target.value))} />
          </div>
          <div>
            <label className="form-label">Allowed Providers (one per line)</label>
            <textarea rows={3} className="form-input" value={(values.auth?.allowedProviders || []).join('\n')} onChange={e => updateArray('auth.allowedProviders', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Redirect URIs (one per line)</label>
            <textarea rows={3} className="form-input" value={(values.auth?.redirectUris || []).join('\n')} onChange={e => updateArray('auth.redirectUris', e.target.value)} />
          </div>
        </div>
      </div>
      )}

      {show('security') && (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">reCAPTCHA Site Key</label>
            <input className="form-input" value={values.security?.recaptchaSiteKey || ''} onChange={e => update('security.recaptchaSiteKey', e.target.value)} />
          </div>
          <div>
            <label className="form-label">reCAPTCHA Secret</label>
            <input className="form-input" value={values.security?.recaptchaSecret || ''} onChange={e => update('security.recaptchaSecret', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Rate Limit (req/sec)</label>
            <input type="number" className="form-input" value={values.security?.rateLimitRps ?? 100} onChange={e => update('security.rateLimitRps', Number(e.target.value))} />
          </div>
          <div>
            <label className="form-label">CORS Origins (one per line)</label>
            <textarea rows={3} className="form-input" value={(values.security?.corsOrigins || []).join('\n')} onChange={e => updateArray('security.corsOrigins', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="form-label">CSP connect-src (one per line)</label>
            <textarea rows={3} className="form-input" value={(values.security?.cspConnectSrc || []).join('\n')} onChange={e => updateArray('security.cspConnectSrc', e.target.value)} />
          </div>
        </div>
      </div>
      )}

      {show('storage') && (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage / CDN</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Bucket</label>
            <input className="form-input" value={values.storage?.bucket || ''} onChange={e => update('storage.bucket', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Region</label>
            <input className="form-input" value={values.storage?.region || ''} onChange={e => update('storage.region', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Access Key ID</label>
            <input className="form-input" value={values.storage?.accessKeyId || ''} onChange={e => update('storage.accessKeyId', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Secret Access Key</label>
            <input type="password" className="form-input" value={values.storage?.secretAccessKey || ''} onChange={e => update('storage.secretAccessKey', e.target.value)} />
          </div>
          <div>
            <label className="form-label">CDN Base URL</label>
            <input className="form-input" value={values.storage?.cdnBaseUrl || ''} onChange={e => update('storage.cdnBaseUrl', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Max Upload (MB)</label>
            <input type="number" className="form-input" value={values.storage?.maxUploadMb ?? 25} onChange={e => update('storage.maxUploadMb', Number(e.target.value))} />
          </div>
        </div>
      </div>
      )}

      {show('analytics') && (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Web Analytics (Admin)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">GA4 Measurement ID</label>
            <input className="form-input" value={values.webAnalytics?.gaMeasurementId || ''} onChange={e => update('webAnalytics.gaMeasurementId', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Consent Mode</label>
            <select className="form-select" value={values.webAnalytics?.consentMode || 'basic'} onChange={e => update('webAnalytics.consentMode', e.target.value)}>
              <option value="auto">Auto</option>
              <option value="basic">Basic</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>
      </div>
      )}

      {show('integrations') && (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Branding & Legal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Logo URL</label>
            <input className="form-input" value={values.branding?.logoUrl || ''} onChange={e => update('branding.logoUrl', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Favicon URL</label>
            <input className="form-input" value={values.branding?.faviconUrl || ''} onChange={e => update('branding.faviconUrl', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Primary Color</label>
            <input type="color" className="form-input" value={values.branding?.primaryColor || '#FA7272'} onChange={e => update('branding.primaryColor', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Terms URL</label>
            <input className="form-input" value={values.branding?.termsUrl || ''} onChange={e => update('branding.termsUrl', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Privacy URL</label>
            <input className="form-input" value={values.branding?.privacyUrl || ''} onChange={e => update('branding.privacyUrl', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Support Email</label>
            <input className="form-input" value={values.branding?.supportEmail || ''} onChange={e => update('branding.supportEmail', e.target.value)} />
          </div>
        </div>
      </div>
      )}

      {show('localization') && (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Localization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Default Locale</label>
            <input className="form-input" value={values.localization?.defaultLocale || 'en'} onChange={e => update('localization.defaultLocale', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Available Locales (one per line)</label>
            <textarea rows={3} className="form-input" value={(values.localization?.availableLocales || []).join('\n')} onChange={e => updateArray('localization.availableLocales', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="form-label">Fallback Behavior</label>
            <select className="form-select" value={values.localization?.fallbackBehavior || 'default'} onChange={e => update('localization.fallbackBehavior', e.target.value)}>
              <option value="default">Default</option>
              <option value="nearest">Nearest</option>
            </select>
          </div>
        </div>
      </div>
      )}

      {show('payments') && (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payments (Stripe)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Publishable Key</label>
            <input className="form-input" value={values.payments?.stripePublishableKey || ''} onChange={e => update('payments.stripePublishableKey', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Secret Key</label>
            <input className="form-input" value={values.payments?.stripeSecretKey || ''} onChange={e => update('payments.stripeSecretKey', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="form-label">Webhook Signing Secret</label>
            <input className="form-input" value={values.payments?.webhookSigningSecret || ''} onChange={e => update('payments.webhookSigningSecret', e.target.value)} />
          </div>
        </div>
      </div>
      )}

      <div className="flex items-center gap-3">
        <button className="btn btn-primary" onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save Integrations'}</button>
        {saved && <span className="text-green-600 text-sm">Saved!</span>}
      </div>
    </div>
  )
}

export default IntegrationsSettings


