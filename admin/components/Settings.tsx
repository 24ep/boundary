'use client'

import { useEffect, useState } from 'react'
import { AdminConsoleUsers } from './AdminConsoleUsers'
import { 
  CogIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline'
import { IntegrationsSettings } from './IntegrationsSettings'
import { settingsService, type BrandingSettings } from '../services/settingsService'

export function Settings() {
  const [activeSection, setActiveSection] = useState<'general' | 'branding' | 'admin-users' | 'integrations'>('branding')
  const [activeSubTab, setActiveSubTab] = useState<
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
  >('integrations')
  const [branding, setBranding] = useState<BrandingSettings>({
    adminAppName: 'Bondarys Admin',
    mobileAppName: 'Bondarys Mobile',
    logoUrl: '',
    iconUrl: ''
  })
  const [savingBranding, setSavingBranding] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [generatingAssets, setGeneratingAssets] = useState(false)
  const [generateStatus, setGenerateStatus] = useState<null | { ok: boolean; message: string }>(null)

  useEffect(() => {
    const load = async () => {
      const b = await settingsService.getBranding()
      if (b) setBranding(prev => ({ ...prev, ...b }))
    }
    load()
  }, [])

  const handleSaveBranding = async () => {
    try {
      setSavingBranding(true)
      const saved = await settingsService.saveBranding(branding)
      if (saved) setBranding(saved)
    } finally {
      setSavingBranding(false)
    }
  }

  const uploadFile = async (file: File, type: 'logo' | 'icon') => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${base}/api/settings/branding/${type}`, {
      method: 'POST',
      credentials: 'include',
      body: form
    })
    if (!res.ok) throw new Error('Upload failed')
    const data = await res.json()
    return data?.url as string
  }
  // moved homescreen background to Page Preferences

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
          <p className="text-gray-600">Configure your Bondarys CMS settings</p>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          <button
            onClick={() => setActiveSection('branding')}
            className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
              activeSection === 'branding'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CogIcon className="h-5 w-5 inline mr-2" />
            Branding
          </button>
          <button
            onClick={() => setActiveSection('general')}
            className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
              activeSection === 'general'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CogIcon className="h-5 w-5 inline mr-2" />
            General Settings
          </button>
          <button
            onClick={() => setActiveSection('integrations')}
            className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
              activeSection === 'integrations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Squares2X2Icon className="h-5 w-5 inline mr-2" />
            Integrations & Auth
          </button>
          <button
            onClick={() => setActiveSection('admin-users')}
            className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
              activeSection === 'admin-users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ShieldCheckIcon className="h-5 w-5 inline mr-2" />
            Admin Console Users
          </button>
        </nav>
      </div>

      {/* Settings Content */}
      {activeSection === 'branding' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Branding</h3>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Admin App Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={branding.adminAppName || ''}
                  onChange={(e) => setBranding({ ...branding, adminAppName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile App Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={branding.mobileAppName || ''}
                  onChange={(e) => setBranding({ ...branding, mobileAppName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Logo URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://..."
                  value={branding.logoUrl || ''}
                  onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                />
                <div className="mt-2 flex items-center space-x-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      try {
                        setUploadingLogo(true)
                        const url = await uploadFile(file, 'logo')
                        setBranding(b => ({ ...b, logoUrl: url }))
                      } finally {
                        setUploadingLogo(false)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  {uploadingLogo && <span className="text-sm text-gray-500">Uploading…</span>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Icon URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://..."
                  value={branding.iconUrl || ''}
                  onChange={(e) => setBranding({ ...branding, iconUrl: e.target.value })}
                />
                <div className="mt-2 flex items-center space-x-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      try {
                        setUploadingIcon(true)
                        const url = await uploadFile(file, 'icon')
                        setBranding(b => ({ ...b, iconUrl: url }))
                      } finally {
                        setUploadingIcon(false)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  {uploadingIcon && <span className="text-sm text-gray-500">Uploading…</span>}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="btn btn-primary" onClick={handleSaveBranding} disabled={savingBranding}>
                  {savingBranding ? 'Saving…' : 'Save Branding'}
                </button>
                {branding.logoUrl && (
                  <img src={branding.logoUrl} alt="Logo preview" className="h-10" />
                )}
                {branding.iconUrl && (
                  <img src={branding.iconUrl} alt="Icon preview" className="h-10 w-10 rounded" />
                )}
              </div>

              <div className="pt-4">
                <button
                  className="btn btn-secondary"
                  onClick={async () => {
                    try {
                      setGeneratingAssets(true)
                      setGenerateStatus(null)
                      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
                      const res = await fetch(`${base}/api/settings/branding/generate-mobile-assets`, { method: 'POST', credentials: 'include' })
                      if (res.ok) {
                        setGenerateStatus({ ok: true, message: 'Mobile assets generated successfully' })
                      } else {
                        const text = await res.text()
                        setGenerateStatus({ ok: false, message: 'Asset generation failed' })
                        console.error('Asset generation failed', text)
                      }
                    } finally {
                      setGeneratingAssets(false)
                    }
                  }}
                  disabled={generatingAssets}
                >
                  {generatingAssets ? 'Generating mobile assets…' : 'Generate mobile assets'}
                </button>
                {generateStatus && (
                  <div className={`mt-2 text-sm ${generateStatus.ok ? 'text-green-600' : 'text-red-600'}`}>
                    {generateStatus.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {activeSection === 'general' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Site Name</label>
                <input type="text" className="form-input" defaultValue="Bondarys CMS" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Site Description</label>
                <textarea className="form-input" rows={3} defaultValue="Family content management system" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Admin Email</label>
                <input type="email" className="form-input" defaultValue="admin@bondarys.com" />
              </div>
              
              <button className="btn btn-primary">Save Settings</button>
            </div>
          </div>

          {/* Homescreen Background moved to Page Preferences */}

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Default Language</label>
                <select className="form-select">
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <select className="form-select">
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Date Format</label>
                <select className="form-select">
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Session Timeout (minutes)</label>
                <input type="number" className="form-input" defaultValue="30" min="5" max="480" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Password Requirements</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox" defaultChecked />
                    <span className="ml-2 text-sm text-gray-700">Minimum 8 characters</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox" defaultChecked />
                    <span className="ml-2 text-sm text-gray-700">Require uppercase letter</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox" defaultChecked />
                    <span className="ml-2 text-sm text-gray-700">Require number</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="ml-2 text-sm text-gray-700">Require special character</span>
                  </label>
                </div>
              </div>
              
              <button className="btn btn-primary">Save Security Settings</button>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'admin-users' && <AdminConsoleUsers />}
      {activeSection === 'integrations' && (
        <div className="space-y-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap gap-2 px-6">
              {[
                { id: 'integrations', label: 'Branding & Legal' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'push', label: 'Push' },
                { id: 'smtp', label: 'SMTP' },
                { id: 'auth', label: 'Auth' },
                { id: 'endpoints', label: 'Links' },
                { id: 'monitoring', label: 'Monitoring' },
                { id: 'security', label: 'Security' },
                { id: 'storage', label: 'Storage/CDN' },
                { id: 'localization', label: 'Localization' },
                { id: 'payments', label: 'Payments' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveSubTab(t.id as any)}
                  className={`py-3 px-4 border-b-2 text-sm font-medium ${
                    activeSubTab === (t.id as any)
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>

          <IntegrationsSettings activeSub={activeSubTab} />
        </div>
      )}
    </div>
  )
}