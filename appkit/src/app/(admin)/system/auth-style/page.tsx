'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ColorPickerPopover, toColorValue } from '@/components/ui/ColorPickerPopover'
import { useToast } from '@/hooks/use-toast'

type DeviceKey = 'mobileApp' | 'mobileWeb' | 'desktopWeb'

interface AuthStyleConfig {
  mobileCommonLayout: {
    layout: string
    fullWidth: boolean
    cardHeightPercent: number
    roundedTop: boolean
  }
  devices: Record<DeviceKey, {
    layout: string
    fullWidth: boolean
    cardHeightPercent: number
    roundedTop: boolean
    appkitLogoUrl?: string
    loginBackground?: any
  }>
}

const DEFAULT_CONFIG: AuthStyleConfig = {
  mobileCommonLayout: {
    layout: 'card-top',
    fullWidth: true,
    cardHeightPercent: 80,
    roundedTop: true,
  },
  devices: {
    mobileApp: {
      layout: 'card-top',
      fullWidth: true,
      cardHeightPercent: 80,
      roundedTop: true,
      appkitLogoUrl: '',
      loginBackground: toColorValue('#FFFFFF'),
    },
    mobileWeb: {
      layout: 'card-top',
      fullWidth: true,
      cardHeightPercent: 80,
      roundedTop: true,
      appkitLogoUrl: '',
      loginBackground: toColorValue('#FFFFFF'),
    },
    desktopWeb: {
      layout: 'centered',
      fullWidth: false,
      cardHeightPercent: 100,
      roundedTop: false,
      appkitLogoUrl: '',
      loginBackground: toColorValue('#F8FAFC'),
    },
  },
}

export default function SystemAuthStylePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<AuthStyleConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('admin_token') || ''
        const res = await fetch('/api/v1/admin/system/config/auth-style', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to load auth style settings')
        const data = await res.json()
        const next = { ...DEFAULT_CONFIG, ...(data?.config || {}) }
        ;(['mobileApp', 'mobileWeb', 'desktopWeb'] as DeviceKey[]).forEach((key) => {
          next.devices[key] = {
            ...DEFAULT_CONFIG.devices[key],
            ...(next.devices?.[key] || {}),
            loginBackground: toColorValue(next.devices?.[key]?.loginBackground || '#FFFFFF'),
          }
        })
        setConfig(next)
      } catch (error) {
        console.error(error)
        toast({ title: 'Load failed', description: 'Could not load auth style settings.', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  const updateDevice = (device: DeviceKey, patch: Partial<AuthStyleConfig['devices'][DeviceKey]>) => {
    setConfig((prev) => ({
      ...prev,
      devices: {
        ...prev.devices,
        [device]: {
          ...prev.devices[device],
          ...patch,
        },
      },
    }))
  }

  const save = async () => {
    try {
      setSaving(true)
      const token = localStorage.getItem('admin_token') || ''
      const res = await fetch('/api/v1/admin/system/config/auth-style', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ config }),
      })
      if (!res.ok) throw new Error('Failed to save auth style')
      toast({ title: 'Saved', description: 'Auth style configuration updated.', variant: 'success' })
    } catch (error) {
      console.error(error)
      toast({ title: 'Save failed', description: 'Could not save auth style configuration.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Auth Style</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Configure login style separately for Mobile App, Mobile Web, and Desktop Web.</p>
      </div>

      <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 space-y-6">
        <div className="rounded-lg border border-blue-200/60 dark:border-blue-500/20 bg-blue-50/40 dark:bg-blue-500/5 p-4">
          <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">Mobile Common Layout</h3>
          <p className="text-xs text-blue-600/80 dark:text-blue-300/80 mt-1">
            Shared for Mobile App + Mobile Web: full width card, 80% height, rounded top.
          </p>
        </div>

        {(['mobileApp', 'mobileWeb', 'desktopWeb'] as DeviceKey[]).map((device) => (
          <div key={device} className="rounded-lg border border-gray-200 dark:border-zinc-800 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {device === 'mobileApp' ? 'Mobile App' : device === 'mobileWeb' ? 'Mobile Web' : 'Desktop Web'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1.5">Layout</label>
                <select
                  title={`${device} layout`}
                  value={config.devices[device].layout}
                  onChange={(e) => updateDevice(device, { layout: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
                >
                  <option value="card-top">Card Top</option>
                  <option value="centered">Centered</option>
                  <option value="split-left">Split Left</option>
                  <option value="split-right">Split Right</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1.5">Card Height (%)</label>
                <input
                  type="number"
                  min={40}
                  max={100}
                  title={`${device} card height percent`}
                  value={config.devices[device].cardHeightPercent}
                  onChange={(e) => updateDevice(device, { cardHeightPercent: Number(e.target.value || 80) })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1.5">AppKit Logo URL</label>
                <input
                  type="url"
                  title={`${device} logo url`}
                  value={config.devices[device].appkitLogoUrl || ''}
                  onChange={(e) => updateDevice(device, { appkitLogoUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm"
                />
              </div>
              <div className="flex items-end gap-6 pb-1">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={Boolean(config.devices[device].fullWidth)}
                    onChange={(e) => updateDevice(device, { fullWidth: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  Full Width
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={Boolean(config.devices[device].roundedTop)}
                    onChange={(e) => updateDevice(device, { roundedTop: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  Rounded Top
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-zinc-400 mb-1.5">Login Background</label>
                <ColorPickerPopover
                  value={toColorValue(config.devices[device].loginBackground || '#FFFFFF')}
                  onChange={(value) => updateDevice(device, { loginBackground: value })}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-3">
          {loading && <span className="text-xs text-gray-500">Loading...</span>}
          <Button onClick={save} disabled={saving || loading} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
            {saving ? 'Saving...' : 'Save Auth Style'}
          </Button>
        </div>
      </div>
    </div>
  )
}
