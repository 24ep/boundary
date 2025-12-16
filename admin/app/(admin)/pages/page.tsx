'use client'

import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../../services/apiConfig'
import { authService } from '../../../services/authService'

interface Page {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

interface ComponentSchema {
  id: string
  type: string
  props: Record<string, any>
  children?: ComponentSchema[]
}

// Available component types for mobile pages
const componentTypes = [
  { type: 'hero', label: 'Hero Section', icon: '🎯', description: 'Large banner with image and text' },
  { type: 'text', label: 'Text Block', icon: '📝', description: 'Rich text content' },
  { type: 'image', label: 'Image', icon: '🖼️', description: 'Single image with caption' },
  { type: 'gallery', label: 'Image Gallery', icon: '📷', description: 'Multiple images in grid' },
  { type: 'button', label: 'Button', icon: '🔘', description: 'Call-to-action button' },
  { type: 'card', label: 'Card', icon: '🃏', description: 'Content card with image and text' },
  { type: 'list', label: 'List', icon: '📋', description: 'Bullet or numbered list' },
  { type: 'spacer', label: 'Spacer', icon: '↕️', description: 'Vertical spacing' },
  { type: 'divider', label: 'Divider', icon: '➖', description: 'Horizontal line separator' },
  { type: 'video', label: 'Video', icon: '🎬', description: 'Embedded video player' },
]

export default function PageBuilderPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [components, setComponents] = useState<ComponentSchema[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [newPageSlug, setNewPageSlug] = useState('')
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('mobile')

  // Fetch pages
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/page-builder/pages`, {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`,
            'Content-Type': 'application/json'
          }
        })
        if (response.ok) {
          const data = await response.json()
          setPages(data.pages || data || [])
        } else {
          // Use mock data if API fails
          setPages([
            { id: '1', title: 'Home Screen', slug: 'home_screen', status: 'published', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '2', title: 'About Us', slug: 'about_us', status: 'draft', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            { id: '3', title: 'Contact', slug: 'contact', status: 'published', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          ])
        }
      } catch (err) {
        // Use mock data on error
        setPages([
          { id: '1', title: 'Home Screen', slug: 'home_screen', status: 'published', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '2', title: 'About Us', slug: 'about_us', status: 'draft', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchPages()
  }, [])

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) return
    
    const slug = newPageSlug || newPageTitle.toLowerCase().replace(/\s+/g, '_')
    const newPage: Page = {
      id: Date.now().toString(),
      title: newPageTitle,
      slug,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    setPages([...pages, newPage])
    setShowCreateModal(false)
    setNewPageTitle('')
    setNewPageSlug('')
    setSelectedPage(newPage)
  }

  const addComponent = (type: string) => {
    const newComponent: ComponentSchema = {
      id: `comp_${Date.now()}`,
      type,
      props: getDefaultProps(type)
    }
    setComponents([...components, newComponent])
  }

  const getDefaultProps = (type: string): Record<string, any> => {
    switch (type) {
      case 'hero': return { title: 'Welcome', subtitle: 'Your subtitle here', imageUrl: '' }
      case 'text': return { content: 'Enter your text here...' }
      case 'image': return { url: '', alt: 'Image description', caption: '' }
      case 'button': return { text: 'Click Me', action: 'navigate', url: '' }
      case 'card': return { title: 'Card Title', description: 'Card description', imageUrl: '' }
      case 'spacer': return { height: 24 }
      case 'divider': return { color: '#e5e7eb', thickness: 1 }
      default: return {}
    }
  }

  const removeComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id))
  }

  const moveComponent = (id: string, direction: 'up' | 'down') => {
    const index = components.findIndex(c => c.id === id)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === components.length - 1) return
    
    const newComponents = [...components]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[newComponents[index], newComponents[swapIndex]] = [newComponents[swapIndex], newComponents[index]]
    setComponents(newComponents)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Page Editor View
  if (selectedPage) {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col">
        {/* Editor Header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedPage(null)}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <div>
              <h2 className="font-semibold text-gray-900">{selectedPage.title}</h2>
              <p className="text-sm text-gray-500">/{selectedPage.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Preview Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['mobile', 'tablet', 'desktop'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPreviewMode(mode)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    previewMode === mode ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode === 'mobile' ? '📱' : mode === 'tablet' ? '📋' : '🖥️'}
                </button>
              ))}
            </div>
            <button className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg">
              Preview
            </button>
            <button className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              Publish
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Component Palette */}
          <div className="w-64 bg-gray-50 border-r overflow-y-auto p-4">
            <h3 className="font-medium text-gray-900 mb-3">Components</h3>
            <div className="space-y-2">
              {componentTypes.map((comp) => (
                <button
                  key={comp.type}
                  onClick={() => addComponent(comp.type)}
                  className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <span className="text-xl">{comp.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{comp.label}</div>
                    <div className="text-xs text-gray-500">{comp.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-gray-200 overflow-y-auto p-6 flex justify-center">
            <div 
              className={`bg-white rounded-lg shadow-lg transition-all duration-300 ${
                previewMode === 'mobile' ? 'w-[375px]' : previewMode === 'tablet' ? 'w-[768px]' : 'w-full max-w-4xl'
              }`}
              style={{ minHeight: '600px' }}
            >
              {components.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                  <span className="text-4xl mb-4">📱</span>
                  <p className="text-center">Drag components here or click to add</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {components.map((comp, index) => (
                    <div key={comp.id} className="group relative border-2 border-dashed border-transparent hover:border-blue-300 rounded-lg p-2">
                      {/* Component Preview */}
                      <ComponentPreview component={comp} />
                      
                      {/* Component Controls */}
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                        <button 
                          onClick={() => moveComponent(comp.id, 'up')}
                          disabled={index === 0}
                          className="w-6 h-6 bg-white rounded border shadow text-xs hover:bg-gray-50 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button 
                          onClick={() => moveComponent(comp.id, 'down')}
                          disabled={index === components.length - 1}
                          className="w-6 h-6 bg-white rounded border shadow text-xs hover:bg-gray-50 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button 
                          onClick={() => removeComponent(comp.id)}
                          className="w-6 h-6 bg-red-500 text-white rounded shadow text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Properties Panel */}
          <div className="w-72 bg-white border-l overflow-y-auto p-4">
            <h3 className="font-medium text-gray-900 mb-3">Properties</h3>
            {components.length === 0 ? (
              <p className="text-sm text-gray-500">Select a component to edit its properties</p>
            ) : (
              <p className="text-sm text-gray-500">Click a component to edit</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Pages List View
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Page Builder</h1>
          <p className="text-gray-500">Create and manage mobile app pages</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
        >
          <span>+</span> New Page
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((page) => (
          <div 
            key={page.id}
            onClick={() => setSelectedPage(page)}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                📄
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                page.status === 'published' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {page.status}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900">{page.title}</h3>
            <p className="text-sm text-gray-500 mb-2">/{page.slug}</p>
            <p className="text-xs text-gray-400">
              Updated {new Date(page.updated_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* Create Page Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Page</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                <input
                  type="text"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  placeholder="e.g., Home Screen"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                <input
                  type="text"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                  placeholder="e.g., home_screen"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreatePage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Component Preview Renderer
function ComponentPreview({ component }: { component: ComponentSchema }) {
  switch (component.type) {
    case 'hero':
      return (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold">{component.props.title}</h2>
          <p className="text-white/80 mt-2">{component.props.subtitle}</p>
        </div>
      )
    case 'text':
      return (
        <div className="p-4">
          <p className="text-gray-700">{component.props.content}</p>
        </div>
      )
    case 'button':
      return (
        <div className="p-4 text-center">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg">
            {component.props.text}
          </button>
        </div>
      )
    case 'card':
      return (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="w-full h-32 bg-gray-200 rounded-lg mb-3"></div>
          <h4 className="font-semibold">{component.props.title}</h4>
          <p className="text-sm text-gray-600">{component.props.description}</p>
        </div>
      )
    case 'spacer':
      return <div style={{ height: component.props.height }} className="bg-gray-100"></div>
    case 'divider':
      return <hr className="border-gray-300" />
    case 'image':
      return (
        <div className="p-4">
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
            🖼️ Image Placeholder
          </div>
        </div>
      )
    default:
      return (
        <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-500">
          {component.type} component
        </div>
      )
  }
}
