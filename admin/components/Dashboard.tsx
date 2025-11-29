'use client'

import { useState, useEffect } from 'react'
import { 
  UserGroupIcon,
  DocumentTextIcon,
  EyeIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalFamilies: number
  totalContent: number
  publishedContent: number
  totalUsers: number
  growth: {
    families: number
    content: number
    users: number
  }
}

interface DashboardProps {
  onManageDashboards?: () => void
}

export function Dashboard({ onManageDashboards }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [savedViews, setSavedViews] = useState<Array<{ id: string; name: string; dateRange: '7d' | '30d' | '90d' }>>([])
  const [activeViewId, setActiveViewId] = useState<string | null>(null)
  const [activityFilter, setActivityFilter] = useState<'all' | 'families' | 'content' | 'users'>('all')
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('admin')

  // Mock sparkline data
  const sparkFamilies = [8, 9, 10, 10, 11, 12, 12]
  const sparkContent = [120, 122, 130, 128, 140, 150, 156]
  const sparkUsers = [32, 34, 36, 39, 42, 44, 48]

  function Sparkline({ values, color }: { values: number[]; color: string }) {
    // Draw a simple path scaled to the container via SVG
    const max = Math.max(...values)
    const min = Math.min(...values)
    const width = 200
    const height = 48
    const norm = values.map((v, i) => {
      const x = (i / (values.length - 1)) * width
      const y = height - ((v - min) / Math.max(1, max - min)) * height
      return `${x},${y}`
    }).join(' ')
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <polyline fill="none" stroke={color} strokeWidth="2" points={norm} />
      </svg>
    )
  }

  useEffect(() => {
    // Load data and saved views
    loadDashboardData()
    const storedViews = localStorage.getItem('admin_dashboard_saved_views')
    if (storedViews) {
      try {
        const parsed = JSON.parse(storedViews)
        setSavedViews(parsed)
      } catch {}
    }
    const storedDateRange = localStorage.getItem('admin_dashboard_date_range') as '7d' | '30d' | '90d' | null
    if (storedDateRange === '7d' || storedDateRange === '30d' || storedDateRange === '90d') {
      setDateRange(storedDateRange)
    }
    const storedRole = localStorage.getItem('admin_dashboard_role') as 'admin' | 'editor' | 'viewer' | null
    if (storedRole === 'admin' || storedRole === 'editor' || storedRole === 'viewer') {
      setRole(storedRole)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('admin_dashboard_date_range', dateRange)
  }, [dateRange])

  useEffect(() => {
    localStorage.setItem('admin_dashboard_role', role)
  }, [role])

  const handleSaveCurrentView = () => {
    const name = prompt('Name this view:')?.trim()
    if (!name) return
    const newView = {
      id: `${Date.now()}`,
      name,
      dateRange
    }
    const next = [...savedViews, newView]
    setSavedViews(next)
    localStorage.setItem('admin_dashboard_saved_views', JSON.stringify(next))
    setActiveViewId(newView.id)
  }

  const handleSelectView = (viewId: string) => {
    setActiveViewId(viewId)
    const view = savedViews.find(v => v.id === viewId)
    if (view) {
      setDateRange(view.dateRange)
    }
  }

  // Keyboard shortcuts: '/' focus search (delegated to Header), 'c' new content, 'g d' go dashboard, 'g u' go users
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ignore if typing in input/textarea/select
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (e as any).isComposing) return

      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        const search = document.querySelector('input[placeholder="Search families, users, content..."]') as HTMLInputElement | null
        search?.focus()
      }
      if ((e.key === 'c' || e.key === 'C') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        alert('Quick create: New content')
      }
      if ((e.key === 'g' || e.key === 'G')) {
        // simple sequence: listen for next key shortly
        const handler = (n: KeyboardEvent) => {
          if (n.key.toLowerCase() === 'd') {
            const params = new URLSearchParams(window.location.search)
            params.set('module', 'dashboard')
            window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`)
            window.dispatchEvent(new PopStateEvent('popstate'))
          } else if (n.key.toLowerCase() === 'u') {
            const params = new URLSearchParams(window.location.search)
            params.set('module', 'users')
            window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`)
            window.dispatchEvent(new PopStateEvent('popstate'))
          }
          window.removeEventListener('keydown', handler, true)
        }
        window.addEventListener('keydown', handler, true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Build unified activity (mock) and filter
  const getUnifiedActivity = () => {
    const all = [
      {
        type: 'content',
        initials: 'JF',
        title: 'Johnson Family Reunion 2024',
        meta: 'Johnson Family • 45 views',
        badge: 'Published',
        badgeBg: 'bg-green-100',
        badgeText: 'text-green-800',
        time: '2 hours ago',
        bg: 'bg-gradient-to-br from-red-500 to-red-600'
      },
      {
        type: 'content',
        initials: 'RC',
        title: "Grandma's Apple Pie Recipe",
        meta: 'Smith Family • 78 views',
        badge: 'Published',
        badgeBg: 'bg-green-100',
        badgeText: 'text-green-800',
        time: '5 hours ago',
        bg: 'bg-gradient-to-br from-green-500 to-green-600'
      },
      {
        type: 'content',
        initials: 'BF',
        title: 'Birthday Celebration Photos',
        meta: 'Brown Family • 32 views',
        badge: 'Draft',
        badgeBg: 'bg-yellow-100',
        badgeText: 'text-yellow-800',
        time: '1 day ago',
        bg: 'bg-gradient-to-br from-blue-500 to-blue-600'
      },
      {
        type: 'families',
        initials: 'SF',
        title: 'Smith Family added a new member',
        meta: 'Users +1 (now 5)',
        badge: 'Update',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-800',
        time: '3 hours ago',
        bg: 'bg-gradient-to-br from-slate-500 to-slate-600'
      },
      {
        type: 'users',
        initials: 'AU',
        title: 'New admin invited',
        meta: 'Email sent to admin@bondarys.com',
        badge: 'Invite',
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-800',
        time: '6 hours ago',
        bg: 'bg-gradient-to-br from-purple-500 to-purple-600'
      }
    ] as Array<any>

    if (activityFilter === 'all') return all
    return all.filter(item => item.type === activityFilter)
  }

  function exportActivityCsv(items: Array<any>) {
    const headers = ['type','title','meta','badge','time']
    const rows = items.map(i => [i.type, i.title, i.meta, i.badge, i.time])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'activity.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function copyLinkWithFilters() {
    const params = new URLSearchParams(window.location.search)
    params.set('module', 'dashboard')
    params.set('dateRange', dateRange)
    params.set('activity', activityFilter)
    const link = `${window.location.origin}${window.location.pathname}?${params.toString()}`
    navigator.clipboard.writeText(link).then(() => {
      // optional toast; keeping simple
      console.log('Link copied:', link)
    }).catch(() => {})
  }

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStats({
        totalFamilies: 12,
        totalContent: 156,
        publishedContent: 134,
        totalUsers: 48,
        growth: {
          families: 15.2,
          content: 8.7,
          users: 23.1
        }
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Intro and Actions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Overview of families, content, and activity.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="sr-only" htmlFor="date-range">Date range</label>
            <select
              id="date-range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-xl bg-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              aria-label="Select date range"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={onManageDashboards}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 text-sm"
                aria-label="Manage dashboards"
              >
                Manage dashboards
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 text-sm" aria-label="Create new content">
                New content
              </button>
            </div>
          </div>
          {/* Role control (demo) */}
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="sr-only" htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-xl bg-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              aria-label="Select role"
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          {/* Saved views controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="sr-only" htmlFor="saved-views">Saved views</label>
            <select
              id="saved-views"
              value={activeViewId || ''}
              onChange={(e) => handleSelectView(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl bg-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              aria-label="Select saved view"
            >
              <option value="">Saved views…</option>
              {savedViews.map(view => (
                <option key={view.id} value={view.id}>{view.name}</option>
              ))}
            </select>
            <button
              onClick={handleSaveCurrentView}
              className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 text-sm"
              aria-label="Save current view"
            >
              Save view
            </button>
          </div>
        </div>
        {/* Quick actions */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-sm font-medium text-gray-800" aria-label="Create a new family">
            Create family
          </button>
          <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-sm font-medium text-gray-800" aria-label="Invite a user">
            Invite user
          </button>
          <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 text-sm font-medium text-gray-800" aria-label="Open the content studio">
            Open content studio
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200" role="region" aria-label="Total families">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Families</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalFamilies}</p>
              <div className="inline-flex items-center mt-2 px-2 py-1 rounded-md text-xs font-medium"
                   aria-label={`Families growth ${stats?.growth.families}%`}>
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1 text-green-600" />
                <span className="text-green-700">+{stats?.growth.families}%</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200" role="region" aria-label="Total content">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Content</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalContent}</p>
              <div className="inline-flex items-center mt-2 px-2 py-1 rounded-md text-xs font-medium"
                   aria-label={`Content growth ${stats?.growth.content}%`}>
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1 text-green-600" />
                <span className="text-green-700">+{stats?.growth.content}%</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200" role="region" aria-label="Published content">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Published</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.publishedContent}</p>
              <div className="mt-2 text-sm text-gray-600 font-medium" aria-live="polite">
                {Math.round((stats?.publishedContent || 0) / (stats?.totalContent || 1) * 100)}% published
              </div>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <EyeIcon className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200" role="region" aria-label="Total users">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalUsers}</p>
              <div className="inline-flex items-center mt-2 px-2 py-1 rounded-md text-xs font-medium"
                   aria-label={`Users growth ${stats?.growth.users}%`}>
                <ArrowTrendingUpIcon className="w-4 h-4 mr-1 text-green-600" />
                <span className="text-green-700">+{stats?.growth.users}%</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <UsersIcon className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Billing widget */}
        {role !== 'viewer' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200" role="region" aria-label="Billing">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Billing</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">Manage</p>
              <div className="mt-3">
                <button
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search)
                    params.set('module', 'users')
                    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`)
                    // Optionally focus users page after navigation; the app reacts to query param
                    window.dispatchEvent(new PopStateEvent('popstate'))
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  Open billing under Users
                </button>
              </div>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <CreditCardIcon className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Quick Insights with Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Families</p>
              <p className="text-xl font-semibold text-gray-900">{stats?.totalFamilies}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-md bg-green-50 text-green-700">+{stats?.growth.families}%</span>
          </div>
          <div className="mt-3 h-12">
            {/* Simple sparkline using CSS gradient */}
            <Sparkline values={sparkFamilies} color="#ef4444" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Content</p>
              <p className="text-xl font-semibold text-gray-900">{stats?.totalContent}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-md bg-green-50 text-green-700">+{stats?.growth.content}%</span>
          </div>
          <div className="mt-3 h-12">
            <Sparkline values={sparkContent} color="#3b82f6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Users</p>
              <p className="text-xl font-semibold text-gray-900">{stats?.totalUsers}</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-md bg-green-50 text-green-700">+{stats?.growth.users}%</span>
          </div>
          <div className="mt-3 h-12">
            <Sparkline values={sparkUsers} color="#8b5cf6" />
          </div>
        </div>
      </div>

      {/* Main sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Activity</h3>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="activity-filter">Filter activity</label>
              <select
                id="activity-filter"
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-xl bg-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="families">Families</option>
                <option value="content">Content</option>
                <option value="users">Users</option>
              </select>
              <button className="text-sm text-red-600 hover:text-red-700 font-medium">View all</button>
            </div>
          </div>
          <div className="space-y-4">
            {getUnifiedActivity().map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-150">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-4 ${item.bg}`}>
                    {item.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{item.meta}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${item.badgeBg} ${item.badgeText}`}>{item.badge}</span>
                  <div className="text-xs text-gray-500 mt-1">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Family Activity</h3>
            <button className="text-sm text-red-600 hover:text-red-700 font-medium">View all</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-150">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-4">
                  JF
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Johnson Family</div>
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <UsersIcon className="w-4 h-4 mr-1" />
                    6 members • 24 content
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Last activity
                </div>
                <div className="text-sm font-semibold text-gray-900">Jan 15, 2024</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-150">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-4">
                  SF
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Smith Family</div>
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <UsersIcon className="w-4 h-4 mr-1" />
                    4 members • 18 content
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Last activity
                </div>
                <div className="text-sm font-semibold text-gray-900">Jan 14, 2024</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-150">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-4">
                  BF
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Brown Family</div>
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <UsersIcon className="w-4 h-4 mr-1" />
                    5 members • 12 content
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Last activity
                </div>
                <div className="text-sm font-semibold text-gray-900">Jan 13, 2024</div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700">All systems normal</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium text-gray-900">99.98%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API latency (p95)</span>
              <span className="text-sm font-medium text-gray-900">182 ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Job queue</span>
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700">3 pending</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportActivityCsv(getUnifiedActivity())}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50"
                aria-label="Export alerts CSV"
              >
                Export CSV
              </button>
              <button
                onClick={copyLinkWithFilters}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50"
                aria-label="Copy link with filters"
              >
                Copy link
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-red-50 rounded-xl border border-red-100">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">Backup failed last night</p>
                <p className="text-xs text-red-700 mt-1">Automatic backup did not complete. Retry required.</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-yellow-50 rounded-xl border border-yellow-100">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-800">Pending content approvals</p>
                <p className="text-xs text-yellow-700 mt-1">4 items awaiting review.</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-800">New platform update available</p>
                <p className="text-xs text-blue-700 mt-1">Version 2.2.0 includes security fixes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}