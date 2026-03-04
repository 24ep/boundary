'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { adminService } from '@/services/adminService'
import {
  XIcon,
  MailIcon,
  SmartphoneIcon,
  BellIcon,
  MessageSquareIcon,
  SaveIcon,
  Loader2Icon,
  RotateCcwIcon,
  ChevronDownIcon,
} from 'lucide-react'

interface CommunicationConfigDrawerProps {
  isOpen: boolean
  onClose: () => void
  appId: string
  appName: string
  initialChannel?: 'email' | 'sms' | 'push' | 'inApp' | null
}

interface CommConfig {
  providers: { id: string; name: string; type: string; enabled: boolean; settings: Record<string, any> }[]
  channels: { email: boolean; sms: boolean; push: boolean; inApp: boolean }
  selectedMethods: { email: string; sms: string; push: string }
  smtpSettings?: { host: string; port: number; username: string; fromEmail: string; fromName: string; secure: boolean }
  methodConfig?: Record<string, Record<string, string>>
}

const CHANNEL_META = [
  { key: 'email' as const, name: 'Email', icon: <MailIcon className="w-4 h-4" /> },
  { key: 'sms' as const, name: 'SMS', icon: <SmartphoneIcon className="w-4 h-4" /> },
  { key: 'push' as const, name: 'Push Notifications', icon: <BellIcon className="w-4 h-4" /> },
  { key: 'inApp' as const, name: 'In-App', icon: <MessageSquareIcon className="w-4 h-4" /> },
]

const METHOD_OPTIONS: Record<string, { value: string; label: string; fields: { key: string; label: string; placeholder: string; type?: string }[] }[]> = {
  email: [
    { value: 'sendgrid', label: 'SendGrid', fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'SG.xxxx...' }, { key: 'fromEmail', label: 'From Email', placeholder: 'noreply@app.com' }, { key: 'fromName', label: 'From Name', placeholder: 'My App' }] },
    { value: 'mailgun', label: 'Mailgun', fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'key-xxxx...' }, { key: 'domain', label: 'Domain', placeholder: 'mg.example.com' }, { key: 'fromEmail', label: 'From Email', placeholder: 'noreply@app.com' }] },
    { value: 'smtp', label: 'Custom SMTP', fields: [{ key: 'host', label: 'SMTP Host', placeholder: 'smtp.example.com' }, { key: 'port', label: 'Port', placeholder: '587', type: 'number' }, { key: 'username', label: 'Username', placeholder: 'user@example.com' }, { key: 'fromEmail', label: 'From Email', placeholder: 'noreply@app.com' }] },
    { value: 'ses', label: 'Amazon SES', fields: [{ key: 'accessKeyId', label: 'Access Key ID', placeholder: 'AKIA...' }, { key: 'secretAccessKey', label: 'Secret Access Key', placeholder: 'xxxx...' }, { key: 'region', label: 'Region', placeholder: 'us-east-1' }] },
  ],
  sms: [
    { value: 'twilio', label: 'Twilio', fields: [{ key: 'accountSid', label: 'Account SID', placeholder: 'AC...' }, { key: 'authToken', label: 'Auth Token', placeholder: 'xxxx...' }, { key: 'fromNumber', label: 'From Number', placeholder: '+1234567890' }] },
    { value: 'vonage', label: 'Vonage (Nexmo)', fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'xxxx...' }, { key: 'apiSecret', label: 'API Secret', placeholder: 'xxxx...' }, { key: 'fromNumber', label: 'From Number', placeholder: '+1234567890' }] },
    { value: 'messagebird', label: 'MessageBird', fields: [{ key: 'accessKey', label: 'Access Key', placeholder: 'xxxx...' }, { key: 'originator', label: 'Originator', placeholder: 'MyApp' }] },
  ],
  push: [
    { value: 'firebase', label: 'Firebase Cloud Messaging', fields: [{ key: 'serverKey', label: 'Server Key', placeholder: 'AAAA...' }, { key: 'projectId', label: 'Project ID', placeholder: 'my-project-id' }] },
    { value: 'onesignal', label: 'OneSignal', fields: [{ key: 'appId', label: 'App ID', placeholder: 'xxxx...' }, { key: 'apiKey', label: 'REST API Key', placeholder: 'xxxx...' }] },
    { value: 'apns', label: 'Apple APNs', fields: [{ key: 'keyId', label: 'Key ID', placeholder: 'xxxx...' }, { key: 'teamId', label: 'Team ID', placeholder: 'xxxx...' }, { key: 'bundleId', label: 'Bundle ID', placeholder: 'com.app.example' }] },
  ],
}

const DEFAULT_COMM_CONFIG: CommConfig = {
  providers: [],
  channels: { email: true, sms: false, push: false, inApp: true },
  selectedMethods: { email: 'sendgrid', sms: 'twilio', push: 'firebase' },
  methodConfig: {},
}

export default function CommunicationConfigDrawer({ isOpen, onClose, appId, appName, initialChannel }: CommunicationConfigDrawerProps) {
  const [config, setConfig] = useState<CommConfig>(DEFAULT_COMM_CONFIG)
  const [defaultConfig, setDefaultConfig] = useState<CommConfig>(DEFAULT_COMM_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null)

  const isSingleChannelMode = !!initialChannel
  const displayChannels = isSingleChannelMode
    ? CHANNEL_META.filter(ch => ch.key === initialChannel)
    : CHANNEL_META
  const singleChannelName = isSingleChannelMode
    ? CHANNEL_META.find(ch => ch.key === initialChannel)?.name || initialChannel
    : null

  useEffect(() => {
    if (isOpen && appId) loadData()
  }, [isOpen, appId])

  useEffect(() => {
    if (!isOpen) return
    setExpandedChannel(initialChannel || null)
  }, [isOpen, initialChannel])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await adminService.getAppConfigOverride(appId, 'comm')

      const defaults = await adminService.getDefaultCommConfig()
      const defCfg = { ...DEFAULT_COMM_CONFIG, ...(defaults.config || {}) }
      setDefaultConfig(defCfg)

      if (!res.useDefault && res.config) {
        setConfig({ ...DEFAULT_COMM_CONFIG, ...res.config })
      } else {
        setConfig(defCfg)
      }
    } catch (err) {
      console.error('Failed to load app comm config:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleChannel = (ch: keyof CommConfig['channels']) => {
    setConfig(prev => ({ ...prev, channels: { ...prev.channels, [ch]: !prev.channels[ch] } }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await adminService.saveAppConfig(appId, 'comm', config)
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isSingleChannelMode ? `${singleChannelName} Config` : 'Communication Config'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{appName}</p>
          </div>
          <button onClick={onClose} title="Close communication config" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-zinc-500">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2Icon className="w-5 h-5 text-blue-500 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {isSingleChannelMode ? 'Channel Configuration' : 'Channels & Providers'}
                </h3>
              </div>

              <div className="space-y-3">
                {displayChannels.map(ch => {
                  const isEnabled = config.channels[ch.key]
                  const isDefaultEnabled = defaultConfig.channels[ch.key]
                  const isOverridden = isEnabled !== isDefaultEnabled
                  const methods = METHOD_OPTIONS[ch.key]
                  const selectedMethod = config.selectedMethods?.[ch.key as keyof typeof config.selectedMethods]
                  const isExpanded = expandedChannel === ch.key

                  return (
                    <div
                      key={ch.key}
                      className={`rounded-xl border transition-all ${
                        isExpanded
                          ? 'border-blue-400 dark:border-blue-500/60 ring-2 ring-blue-400/20 dark:ring-blue-500/20'
                          : isOverridden
                          ? 'border-orange-500/30 bg-orange-500/5'
                          : 'border-blue-200/80 dark:border-blue-500/30 bg-blue-50/20 dark:bg-blue-500/5'
                      }`}
                    >
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => setExpandedChannel(isExpanded ? null : ch.key)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-sm ${
                            isOverridden
                              ? 'bg-orange-100 text-orange-600'
                              : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'
                          }`}>
                            {ch.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{ch.name}</span>
                              {isOverridden && (
                                <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-500/20 text-[9px] font-bold text-orange-600 uppercase rounded">Custom</span>
                              )}
                            </div>
                            <p className="text-[10px] mt-0.5">
                              {isEnabled
                                ? <span className="text-emerald-600 dark:text-emerald-400">Enabled</span>
                                : <span className="text-gray-400">Disabled</span>
                              }
                              {methods && selectedMethod && isEnabled && (
                                <span className="text-gray-400 ml-1">· {methods.find(m => m.value === selectedMethod)?.label || selectedMethod}</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          {isOverridden && (
                            <button
                              onClick={() => setConfig(prev => ({ ...prev, channels: { ...prev.channels, [ch.key]: !!isDefaultEnabled } }))}
                              className="p-1.5 hover:bg-orange-100 rounded-md text-orange-500"
                              title="Reset to Default"
                            >
                              <RotateCcwIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              title={`${ch.name} enabled`}
                              className="sr-only peer"
                              checked={isEnabled}
                              onChange={() => toggleChannel(ch.key)}
                            />
                            <div className="w-9 h-5 bg-gray-200 dark:bg-zinc-700 peer-checked:bg-blue-500 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-full" />
                          </label>
                          <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {/* Expanded config for this channel */}
                      {isExpanded && methods && (
                        <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-zinc-800/50 space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1.5">Provider</label>
                            <div className="flex flex-wrap gap-1.5">
                              {methods.map(m => (
                                <button
                                  key={m.value}
                                  onClick={() => setConfig(prev => ({ ...prev, selectedMethods: { ...prev.selectedMethods, [ch.key]: m.value } }))}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                    selectedMethod === m.value
                                      ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-500/50 text-blue-600 dark:text-blue-400 shadow-sm'
                                      : 'border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                                  }`}
                                >
                                  {m.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Provider config fields */}
                          {selectedMethod && (() => {
                            const selectedProvider = methods.find(m => m.value === selectedMethod)
                            if (!selectedProvider) return null
                            const methodKey = `${ch.key}_${selectedMethod}`
                            return (
                              <div className="grid grid-cols-2 gap-2.5 pt-1">
                                {selectedProvider.fields.map(field => (
                                  <div key={field.key} className={selectedProvider.fields.length % 2 !== 0 && field === selectedProvider.fields[selectedProvider.fields.length - 1] ? 'col-span-2' : ''}>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">{field.label}</label>
                                    <input
                                      type={field.type || 'text'}
                                      placeholder={field.placeholder}
                                      value={config.methodConfig?.[methodKey]?.[field.key] || ''}
                                      onChange={e => {
                                        setConfig(prev => ({
                                          ...prev,
                                          methodConfig: {
                                            ...prev.methodConfig,
                                            [methodKey]: {
                                              ...(prev.methodConfig?.[methodKey] || {}),
                                              [field.key]: e.target.value,
                                            },
                                          },
                                        }))
                                      }}
                                      className="w-full px-3 py-1.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                  </div>
                                ))}
                              </div>
                            )
                          })()}
                        </div>
                      )}

                      {/* Expanded — channel has no sub-providers (inApp) */}
                      {isExpanded && !methods && (
                        <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-zinc-800/50">
                          <p className="text-xs text-gray-400">No additional configuration required for this channel.</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && (
          <div className="p-6 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-end space-x-2">
            {saveMessage && (
              <span className={`text-sm font-medium mr-2 ${saveMessage === 'Saved!' ? 'text-emerald-600' : 'text-red-500'}`}>
                {saveMessage}
              </span>
            )}
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
