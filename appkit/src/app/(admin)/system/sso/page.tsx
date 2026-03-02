'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/use-toast'

interface SsoProviderConfig {
  enabled: boolean
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string
  tenantId?: string
}

interface SsoConfig {
  enabled: boolean
  providers: {
    google: SsoProviderConfig
    azure: SsoProviderConfig
  }
}

const DEFAULT_CONFIG: SsoConfig = {
  enabled: false,
  providers: {
    google: {
      enabled: false,
      clientId: '',
      clientSecret: '',
      redirectUri: '',
      scopes: 'openid profile email',
    },
    azure: {
      enabled: false,
      tenantId: '',
      clientId: '',
      clientSecret: '',
      redirectUri: '',
      scopes: 'openid profile email',
    },
  },
}

export default function SystemSsoPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<SsoConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('admin_token') || ''
        const res = await fetch('/api/v1/admin/system/config/sso', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('Failed to load SSO config')
        const data = await res.json()
        setConfig({ ...DEFAULT_CONFIG, ...(data?.config || {}) })
      } catch (error) {
        console.error(error)
        toast({ title: 'Load failed', description: 'Could not load SSO configuration.', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  const save = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('admin_token') || ''
      const res = await fetch('/api/v1/admin/system/config/sso', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ config }),
      })
      if (!res.ok) throw new Error('Failed to save SSO config')
      toast({ title: 'Saved', description: 'SSO configuration updated.', variant: 'success' })
    } catch (error) {
      console.error(error)
      toast({ title: 'Save failed', description: 'Could not save SSO configuration.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const updateProvider = (provider: 'google' | 'azure', key: keyof SsoProviderConfig, value: string | boolean) => {
    setConfig((prev) => ({
      ...prev,
      providers: {
        ...prev.providers,
        [provider]: {
          ...prev.providers[provider],
          [key]: value,
        },
      },
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SSO Configuration</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Configure AppKit-level Google and Azure SSO providers.</p>
      </div>

      <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 space-y-6">
        <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => setConfig((prev) => ({ ...prev, enabled: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300"
          />
          Enable SSO globally
        </label>

        {(['google', 'azure'] as const).map((provider) => (
          <div key={provider} className="rounded-lg border border-gray-200 dark:border-zinc-800 p-4 space-y-4">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={config.providers[provider].enabled}
                onChange={(e) => updateProvider(provider, 'enabled', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              Enable {provider === 'google' ? 'Google SSO' : 'Azure SSO'}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {provider === 'azure' && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1.5">Tenant ID</label>
                  <input
                    type="text"
                    title="Azure tenant ID"
                    value={config.providers.azure.tenantId || ''}
                    onChange={(e) => updateProvider('azure', 'tenantId', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1.5">Client ID</label>
                <input
                  type="text"
                  title={`${provider} client id`}
                  value={config.providers[provider].clientId}
                  onChange={(e) => updateProvider(provider, 'clientId', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1.5">Client Secret</label>
                <input
                  type="password"
                  title={`${provider} client secret`}
                  value={config.providers[provider].clientSecret}
                  onChange={(e) => updateProvider(provider, 'clientSecret', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1.5">Redirect URI</label>
                <input
                  type="url"
                  title={`${provider} redirect uri`}
                  value={config.providers[provider].redirectUri}
                  onChange={(e) => updateProvider(provider, 'redirectUri', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1.5">Scopes (space separated)</label>
                <input
                  type="text"
                  title={`${provider} scopes`}
                  value={config.providers[provider].scopes}
                  onChange={(e) => updateProvider(provider, 'scopes', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-3">
          {loading && <span className="text-xs text-gray-500">Loading...</span>}
          <Button onClick={save} disabled={saving || loading} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
            {saving ? 'Saving...' : 'Save SSO'}
          </Button>
        </div>
      </div>
    </div>
  )
}
