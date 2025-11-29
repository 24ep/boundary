'use client'

import React, { useState, useEffect } from 'react'
import { 
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CogIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  TableCellsIcon,
  CalendarIcon,
  DocumentTextIcon,
  PhotoIcon,
  CloudIcon
} from '@heroicons/react/24/outline'
import { DashboardStudio } from './DashboardStudio'

interface Dashboard {
  id: string
  name: string
  description: string
  isDefault: boolean
  widgets: DashboardWidget[]
  createdAt: string
  updatedAt: string
}

interface DashboardWidget {
  id: string
  type: string
  title: string
  position: { x: number; y: number; w: number; h: number }
  config: Record<string, any>
}

interface DashboardManagementProps {
  onBack: () => void
}

export const DashboardManagement: React.FC<DashboardManagementProps> = ({ onBack }) => {
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    loadDashboards()
  }, [])

  const loadDashboards = async () => {
    try {
      setLoading(true)
      // Mock data for now - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockDashboards = [
        {
          id: '1',
          name: 'Main Dashboard',
          description: 'Primary dashboard for family management',
          isDefault: true,
          widgets: [
            { id: 'w1', type: 'stats', title: 'Family Stats', position: { x: 0, y: 0, w: 6, h: 4 }, config: {} },
            { id: 'w2', type: 'chart', title: 'Activity Chart', position: { x: 6, y: 0, w: 6, h: 4 }, config: {} }
          ],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-15'
        },
        {
          id: '2',
          name: 'Analytics Dashboard',
          description: 'Detailed analytics and reporting',
          isDefault: false,
          widgets: [
            { id: 'w3', type: 'chart', title: 'User Engagement', position: { x: 0, y: 0, w: 12, h: 6 }, config: {} },
            { id: 'w4', type: 'table', title: 'Recent Activity', position: { x: 0, y: 6, w: 12, h: 4 }, config: {} }
          ],
          createdAt: '2024-01-10',
          updatedAt: '2024-01-12'
        },
        {
          id: '3',
          name: 'Content Management',
          description: 'Manage family content and media',
          isDefault: false,
          widgets: [
            { id: 'w5', type: 'table', title: 'Content Library', position: { x: 0, y: 0, w: 8, h: 5 }, config: {} },
            { id: 'w6', type: 'stats', title: 'Storage Usage', position: { x: 8, y: 0, w: 4, h: 5 }, config: {} }
          ],
          createdAt: '2024-01-05',
          updatedAt: '2024-01-08'
        },
        {
          id: '4',
          name: 'User Activity',
          description: 'Monitor user engagement and activity',
          isDefault: false,
          widgets: [
            { id: 'w7', type: 'chart', title: 'Daily Active Users', position: { x: 0, y: 0, w: 6, h: 4 }, config: {} },
            { id: 'w8', type: 'stats', title: 'Session Metrics', position: { x: 6, y: 0, w: 6, h: 4 }, config: {} },
            { id: 'w9', type: 'table', title: 'Recent Logins', position: { x: 0, y: 4, w: 12, h: 4 }, config: {} }
          ],
          createdAt: '2024-01-03',
          updatedAt: '2024-01-06'
        }
      ]
      
      setDashboards(mockDashboards)
      if (mockDashboards.length > 0) {
        setSelectedDashboard(mockDashboards[0])
      }
    } catch (error) {
      console.error('Error loading dashboards:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDashboards = dashboards.filter(dashboard =>
    dashboard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dashboard.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDashboardSelect = (dashboard: Dashboard) => {
    setSelectedDashboard(dashboard)
    setEditMode(false)
  }

  const handleCreateDashboard = () => {
    setEditingDashboard(null)
    setShowCreateForm(true)
  }

  const handleEditDashboard = (dashboard: Dashboard) => {
    setEditingDashboard(dashboard)
    setShowCreateForm(true)
  }

  const handleDeleteDashboard = async (dashboardId: string) => {
    if (confirm('Are you sure you want to delete this dashboard?')) {
      try {
        setDashboards(prev => prev.filter(d => d.id !== dashboardId))
        if (selectedDashboard?.id === dashboardId) {
          const remaining = dashboards.filter(d => d.id !== dashboardId)
          setSelectedDashboard(remaining.length > 0 ? remaining[0] : null)
        }
      } catch (error) {
        console.error('Error deleting dashboard:', error)
        alert('Error deleting dashboard')
      }
    }
  }

  const handleSaveDashboard = (dashboardData: Partial<Dashboard>) => {
    if (editingDashboard) {
      // Update existing dashboard
      const updatedDashboard = { ...editingDashboard, ...dashboardData, updatedAt: new Date().toISOString() }
      setDashboards(prev => prev.map(d => 
        d.id === editingDashboard.id ? updatedDashboard : d
      ))
      if (selectedDashboard?.id === editingDashboard.id) {
        setSelectedDashboard(updatedDashboard)
      }
    } else {
      // Create new dashboard
      const newDashboard: Dashboard = {
        id: Date.now().toString(),
        name: dashboardData.name || 'New Dashboard',
        description: dashboardData.description || '',
        isDefault: false,
        widgets: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setDashboards(prev => [newDashboard, ...prev])
      setSelectedDashboard(newDashboard)
    }
    setShowCreateForm(false)
    setEditingDashboard(null)
  }

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'chart': return <ChartBarIcon className="h-4 w-4" />
      case 'table': return <TableCellsIcon className="h-4 w-4" />
      case 'calendar': return <CalendarIcon className="h-4 w-4" />
      case 'stats': return <Squares2X2Icon className="h-4 w-4" />
      case 'gallery': return <PhotoIcon className="h-4 w-4" />
      case 'text': return <DocumentTextIcon className="h-4 w-4" />
      case 'storage': return <CloudIcon className="h-4 w-4" />
      default: return <CogIcon className="h-4 w-4" />
    }
  }

  if (showCreateForm) {
    return (
      <DashboardForm
        dashboard={editingDashboard}
        onSave={handleSaveDashboard}
        onCancel={() => {
          setShowCreateForm(false)
          setEditingDashboard(null)
        }}
      />
    )
  }

  return (
    <div className="flex h-full">
      {/* Secondary Sidebar - Dashboard List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="btn btn-secondary btn-sm"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back
            </button>
            <button
              onClick={handleCreateDashboard}
              className="btn btn-primary btn-sm"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              New
            </button>
          </div>
          
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Dashboards</h2>
          
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search dashboards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        {/* Dashboard List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            </div>
          ) : filteredDashboards.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'No dashboards found' : 'No dashboards available'}
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {filteredDashboards.map((dashboard) => (
                <div
                  key={dashboard.id}
                  onClick={() => handleDashboardSelect(dashboard)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedDashboard?.id === dashboard.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{dashboard.name}</h3>
                        {dashboard.isDefault && (
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{dashboard.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{dashboard.widgets.length} widgets</span>
                        <span>Updated {new Date(dashboard.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditDashboard(dashboard)
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit dashboard"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteDashboard(dashboard.id)
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete dashboard"
                        disabled={dashboard.isDefault}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {selectedDashboard ? (
          <>
            {/* Dashboard Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedDashboard.name}</h1>
                  <p className="text-gray-600 mt-1">{selectedDashboard.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className={`btn ${editMode ? 'btn-secondary' : 'btn-primary'}`}
                  >
                    {editMode ? (
                      <>
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View Mode
                      </>
                    ) : (
                      <>
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit Mode
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="flex-1 p-4 bg-gray-50">
              {editMode ? (
                <DashboardStudio 
                  dashboard={selectedDashboard}
                  onSave={(updatedDashboard) => {
                    setDashboards(prev => prev.map(d => 
                      d.id === updatedDashboard.id ? updatedDashboard : d
                    ))
                    setSelectedDashboard(updatedDashboard)
                  }}
                />
              ) : (
                <DashboardViewer dashboard={selectedDashboard} />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Dashboard Selected</h3>
              <p className="text-gray-600 mb-4">Select a dashboard from the sidebar to view it</p>
              <button onClick={handleCreateDashboard} className="btn btn-primary">
                <PlusIcon className="h-4 w-4 mr-2" />
                Create New Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Dashboard Viewer Component
function DashboardViewer({ dashboard }: { dashboard: Dashboard }) {
  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'chart': return <ChartBarIcon className="h-4 w-4" />
      case 'table': return <TableCellsIcon className="h-4 w-4" />
      case 'calendar': return <CalendarIcon className="h-4 w-4" />
      case 'stats': return <Squares2X2Icon className="h-4 w-4" />
      case 'gallery': return <PhotoIcon className="h-4 w-4" />
      case 'text': return <DocumentTextIcon className="h-4 w-4" />
      case 'storage': return <CloudIcon className="h-4 w-4" />
      default: return <CogIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      {dashboard.widgets.map((widget) => (
        <div
          key={widget.id}
          className="card"
          style={{
            gridColumn: `span ${widget.position.w}`,
            gridRow: `span ${widget.position.h}`
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">{widget.title}</h3>
            <div className="text-gray-400">
              {getWidgetIcon(widget.type)}
            </div>
          </div>
          
          <div className="h-full">
            {widget.type === 'stats' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">12</div>
                  <div className="text-sm text-gray-500">Total Families</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">156</div>
                  <div className="text-sm text-gray-500">Total Content</div>
                </div>
              </div>
            )}
            
            {widget.type === 'chart' && (
              <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500">Chart Widget</span>
              </div>
            )}
            
            {widget.type === 'table' && (
              <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500">Table Widget</span>
              </div>
            )}

            {widget.type === 'calendar' && (
              <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500">Calendar Widget</span>
              </div>
            )}

            {widget.type === 'gallery' && (
              <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500">Gallery Widget</span>
              </div>
            )}

            {widget.type === 'text' && (
              <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500">Text Widget</span>
              </div>
            )}

            {widget.type === 'storage' && (
              <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500">Storage Widget</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// Note: DashboardStudio component is now imported from separate file

// Dashboard Form Component
interface DashboardFormProps {
  dashboard?: Dashboard | null
  onSave: (data: Partial<Dashboard>) => void
  onCancel: () => void
}

const DashboardForm: React.FC<DashboardFormProps> = ({ dashboard, onSave, onCancel }) => {
  const [name, setName] = useState(dashboard?.name || '')
  const [description, setDescription] = useState(dashboard?.description || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      description: description.trim()
    })
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {dashboard ? 'Edit Dashboard' : 'Create New Dashboard'}
          </h2>
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Dashboard Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="Enter dashboard name"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
              rows={3}
              placeholder="Enter dashboard description"
            />
          </div>
          
          <div className="flex space-x-3">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {dashboard ? 'Update Dashboard' : 'Create Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}