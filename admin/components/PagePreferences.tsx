'use client'

import { useEffect, useState } from 'react'

export function PagePreferences() {
  const [activeTab, setActiveTab] = useState<'homescreen'>('homescreen')
  const [bgType, setBgType] = useState<'color' | 'gradient' | 'image'>('color')
  const [bgColors, setBgColors] = useState<string[]>(['#ffffff'])
  const [bgImage, setBgImage] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string>('')
  const [selectedFileName, setSelectedFileName] = useState<string>('')

  const uploadEndpoint = () => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
    return base.replace(/\/api$/i, '') + '/api/v1/storage/upload'
  }

  const handleFilePicked = async (file: File) => {
    setSelectedFileName(file.name)
    const objUrl = URL.createObjectURL(file)
    setLocalPreviewUrl(objUrl)
    setBgType('image')
    setBgImage(objUrl)
    try {
      setUploading(true)
      const form = new FormData()
      form.append('file', file)
      // Optional: mark as shared/public
      form.append('isShared', 'true')

      const token = localStorage.getItem('admin_token') || ''
      const res = await fetch(uploadEndpoint(), {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: form
      })
      if (!res.ok) throw new Error('Upload failed')
      const json = await res.json()
      const uploaded = json.file || json.data || json
      const url = uploaded?.public_url || uploaded?.url || uploaded?.path || ''
      if (url) {
        setBgImage(url)
      }
    } catch (e) {
      alert('Image upload failed. Using local preview only.')
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const svc = (await import('../services/adminService')).adminService
        const res = await svc.getApplicationSettings()
        const draft = res.settings?.find((s: any) => s.setting_key === 'homescreen.background.draft')
        const published = res.settings?.find((s: any) => s.setting_key === 'homescreen.background.public')
        const found = draft?.setting_value || published?.setting_value || res.settings?.find((s: any) => s.setting_key === 'homescreen.background')?.setting_value
        if (found) {
          const v = found
          setBgType(v.type || 'color')
          setBgColors(Array.isArray(v.colors) && v.colors.length ? v.colors.slice(0,3) : ['#ffffff'])
          setBgImage(v.imageUrl || '')
        }
      } catch (e) {
        // ignore
      }
    })()
  }, [])

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Secondary Sidebar */}
      <aside className="col-span-12 lg:col-span-3">
        <div className="card p-0 overflow-hidden">
          <div className="border-b px-4 py-3 text-sm font-semibold text-gray-700">Pages</div>
          <nav className="p-2">
            <button
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeTab==='homescreen' ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
              onClick={() => setActiveTab('homescreen')}
            >
              Homescreen
            </button>
          </nav>
        </div>
      </aside>

      {/* Content */}
      <section className="col-span-12 lg:col-span-9 space-y-6">
        {activeTab === 'homescreen' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Homescreen Background</h3>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label mr-4">Type</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="bgType" value="color" checked={bgType==='color'} onChange={() => setBgType('color')} />
                    <span>Color</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="bgType" value="gradient" checked={bgType==='gradient'} onChange={() => setBgType('gradient')} />
                    <span>2–3 Color Gradient</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="radio" name="bgType" value="image" checked={bgType==='image'} onChange={() => setBgType('image')} />
                    <span>Image</span>
                  </label>
                </div>
              </div>

              {bgType === 'color' && (
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div className="flex gap-3 items-center">
                    <input type="color" value={bgColors[0] || '#ffffff'} onChange={e => setBgColors([e.target.value])} className="h-10 w-12 p-0 border rounded" />
                    <input type="text" value={bgColors[0] || ''} onChange={e => setBgColors([e.target.value])} className="form-input" />
                  </div>
                </div>
              )}

              {bgType === 'gradient' && (
                <div className="form-group">
                  <label className="form-label">Gradient Colors (2–3)</label>
                  <div className="space-y-2">
                    {[0,1,2].map(i => (
                      <div key={i} className="flex gap-3 items-center">
                        <input type="color" value={bgColors[i] || '#ffffff'} onChange={e => { const next=[...bgColors]; next[i]=e.target.value; setBgColors(next.filter(Boolean).slice(0,3)); }} className="h-10 w-12 p-0 border rounded" />
                        <input type="text" value={bgColors[i] || ''} onChange={e => { const next=[...bgColors]; next[i]=e.target.value; setBgColors(next.filter(Boolean).slice(0,3)); }} className="form-input" placeholder={i<2 ? `Color ${i+1} (required)` : 'Color 3 (optional)'} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bgType === 'image' && (
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <div className="space-y-2">
                    <input type="text" value={bgImage} onChange={e => setBgImage(e.target.value)} className="form-input" placeholder="https://.../background.jpg" />
                    <div className="flex items-center gap-3">
                      <input
                        id="bg-file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFilePicked(file)
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => document.getElementById('bg-file-input')?.click()}
                      >
                        {uploading ? 'Uploading…' : 'Upload Image'}
                      </button>
                      {selectedFileName && (
                        <span className="text-sm text-gray-600 truncate max-w-xs">{selectedFileName}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm text-gray-600 mb-2">Preview</div>
                <div className="relative">
                  <div
                    className="rounded border h-40"
                    style={{
                      background: (
                        bgType === 'color'
                          ? (bgColors[0] || '#ffffff')
                          : bgType === 'gradient'
                            ? `linear-gradient(135deg, ${bgColors.filter(Boolean).slice(0,3).join(', ')})`
                            : `url(${(localPreviewUrl || bgImage) || ''}) center/cover no-repeat`
                      )
                    }}
                  />
                  {showPreview && (
                    <div className="absolute inset-0 rounded border-2 border-blue-300 pointer-events-none" />
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                className={`btn btn-primary ${saving ? 'opacity-70 pointer-events-none' : ''}`}
                onClick={async () => {
                  try {
                    setSaving(true)
                    const svc = (await import('../services/adminService')).adminService
                    await svc.upsertApplicationSetting({
                      setting_key: 'homescreen.background.draft',
                      setting_value: {
                        type: bgType,
                        colors: bgType === 'color' ? [bgColors[0]] : bgColors.filter(Boolean).slice(0,3),
                        imageUrl: bgType === 'image' ? (bgImage || '') : undefined,
                      },
                      setting_type: 'json',
                      category: 'appearance',
                      description: 'Homescreen background configuration (draft)',
                      is_public: true,
                      is_editable: true,
                    })
                    alert('Draft saved.')
                  } catch (e) {
                    alert('Failed to save draft.')
                  } finally {
                    setSaving(false)
                  }
                }}
              >
                Save Draft
              </button>

              <button
                className={`btn btn-secondary ${publishing ? 'opacity-70 pointer-events-none' : ''}`}
                onClick={async () => {
                  try {
                    setPublishing(true)
                    // Publish by copying draft to public
                    const value = {
                      type: bgType,
                      colors: bgType === 'color' ? [bgColors[0]] : bgColors.filter(Boolean).slice(0,3),
                      imageUrl: bgType === 'image' ? (bgImage || '') : undefined,
                    }
                    const svc = (await import('../services/adminService')).adminService
                    await svc.upsertApplicationSetting({
                      setting_key: 'homescreen.background.public',
                      setting_value: value,
                      setting_type: 'json',
                      category: 'appearance',
                      description: 'Homescreen background configuration (public)',
                      is_public: true,
                      is_editable: true,
                    })
                    alert('Published to public background.')
                  } catch (e) {
                    alert('Failed to publish background.')
                  } finally {
                    setPublishing(false)
                  }
                }}
              >
                Publish
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Hide Preview' : 'Preview Draft'}
              </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}


