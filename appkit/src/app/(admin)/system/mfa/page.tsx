'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/use-toast'

interface MfaConfig {
  enforceMfa: boolean
  allowedTypes: string[]
  rememberDeviceDays: number
  backupCodesEnabled: boolean
  challengeOnHighRiskOnly: boolean
}

const DEFAULT_CONFIG: MfaConfig = {
  enforceMfa: false,
  allowedTypes: ['totp'],
  rememberDeviceDays: 30,
  backupCodesEnabled: true,
  challengeOnHighRiskOnly: false,
}

const AVAILABLE_TYPES = ['totp', 'email', 'sms', 'webauthn']

export default function SystemMfaPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<MfaConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('admin_token') || ''
        const res = await fetch('/api/v1/admin/system/config/mfa', { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) throw new Error('Failed to load MFA config')
        const data = await res.json()
        setConfig({ ...DEFAULT_CONFIG, ...(data?.config || {}) })
      } catch (error) {
        console.error(error)
        toast({ title: 'Load failed', description: 'Could not load 2FA/MFA configuration.', variant: 'destructive' })
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
      const res = await fetch('/api/v1/admin/system/config/mfa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ config }),
      })
      if (!res.ok) throw new Error('Failed to save MFA config')
      toast({ title: 'Saved', description: '2FA/MFA configuration updated.', variant: 'success' })
    } catch (error) {
      console.error(error)
      toast({ title: 'Save failed', description: 'Could not save 2FA/MFA configuration.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const toggleType = (type: string) => {
    setConfig((prev) => ({
      ...prev,
      allowedTypes: prev.allowedTypes.includes(type)
        ? prev.allowedTypes.filter((item) => item !== type)
        : [...prev.allowedTypes, type],
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">2FA / MFA</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Configure global multi-factor authentication policy for AppKit.</p>
      </div>

      <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 space-y-5">
        <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
          <input type="checkbox" checked={config.enforceMfa} onChange={(e) => setConfig((prev) => ({ ...prev, enforceMfa: e.target.checked }))} className="w-4 h-4 rounded border-gray-300" />
          Enforce MFA for all admin sign-ins
        </label>

        <div>
          <p className="text-xs font-medium text-gray-600 dark:text-zinc-400 mb-2">Allowed Methods</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TYPES.map((type) => (
              <label key={type} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 text-sm">
                <input
                  type="checkbox"
                  checked={config.allowedTypes.includes(type)}
                  onChange={() => toggleType(type)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                {type.toUpperCase()}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1.5">Remember Device (days)</label>
            <input
              type="number"
              min={0}
              value={config.rememberDeviceDays}
              title="Remember device days"
              onChange={(e) => setConfig((prev) => ({ ...prev, rememberDeviceDays: Number(e.target.value || 0) }))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
            />
          </div>
          <div className="flex flex-col justify-end gap-2 pb-1">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
              <input type="checkbox" checked={config.backupCodesEnabled} onChange={(e) => setConfig((prev) => ({ ...prev, backupCodesEnabled: e.target.checked }))} className="w-4 h-4 rounded border-gray-300" />
              Enable backup codes
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
              <input type="checkbox" checked={config.challengeOnHighRiskOnly} onChange={(e) => setConfig((prev) => ({ ...prev, challengeOnHighRiskOnly: e.target.checked }))} className="w-4 h-4 rounded border-gray-300" />
              Challenge only on high-risk events
            </label>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-3">
          {loading && <span className="text-xs text-gray-500">Loading...</span>}
          <Button onClick={save} disabled={saving || loading} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
            {saving ? 'Saving...' : 'Save 2FA / MFA'}
          </Button>
        </div>
      </div>
    </div>
  )
}
