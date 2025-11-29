'use client'

import { useEffect, useState } from 'react'
import { 
  HomeIcon,
  UsersIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ShieldExclamationIcon,
  ShareIcon,
  TicketIcon,
  PaintBrushIcon,
  
  CogIcon,
  DocumentTextIcon,
  BellIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

interface SidebarProps {
  activeModule: string
  setActiveModule: (module: string) => void
  familyCount?: number
  safetyCount?: number
  ticketCount?: number
}

export function Sidebar({ activeModule, setActiveModule, familyCount, safetyCount, ticketCount }: SidebarProps) {
  const [branding, setBranding] = useState<{ adminAppName?: string; logoUrl?: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        const res = await fetch(`${base}/api/settings/branding`, { credentials: 'include' })
        const data = await res.json()
        setBranding(data?.branding || null)
      } catch {
        setBranding(null)
      }
    }
    load()
  }, [])
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: HomeIcon,
      badge: null
    },
    { 
      id: 'users', 
      label: 'Users', 
      icon: UsersIcon,
      badge: null
    },
    { 
      id: 'localization', 
      label: 'Localization', 
      icon: GlobeAltIcon,
      badge: null
    },
    { 
      id: 'families', 
      label: 'Families', 
      icon: UserGroupIcon,
      badge: familyCount?.toString() || '0'
    },
    { 
      id: 'safety', 
      label: 'Safety', 
      icon: ShieldExclamationIcon,
      badge: safetyCount && safetyCount > 0 ? safetyCount.toString() : null
    },
    { 
      id: 'social', 
      label: 'Social Media', 
      icon: ShareIcon,
      badge: null
    },
    { 
      id: 'tickets', 
      label: 'Tickets', 
      icon: TicketIcon,
      badge: ticketCount && ticketCount > 0 ? ticketCount.toString() : null
    },
    { 
      id: 'dynamic-content', 
      label: 'Content', 
      icon: PaintBrushIcon,
      badge: null
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: CogIcon,
      badge: null
    }
  ]

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          {branding?.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" className="w-10 h-10 rounded-xl shadow-lg object-cover" />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">B</span>
            </div>
          )}
          <div className="ml-3">
            <h1 className="text-xl font-bold text-gray-900">{branding?.adminAppName || 'Bondarys'}</h1>
            <p className="text-sm text-gray-500">Admin Console</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeModule === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center">
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  isActive 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer removed: profile selection moved out of sidebar */}
    </div>
  )
}

function icon(name: string, cls = 'h-4 w-4') {
  const attrs = `class=\"${cls}\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"`;
  const paths: Record<string, string> = {
    'chart-bar': '<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M3 3v18h18\" /><path stroke-linecap=\"round\" d=\"M7 15v-6m6 6V9m6 6v-9\" />',
    'document-text': '<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M19.5 14.25v2.25A2.25 2.25 0 0 1 17.25 18.75H6.75A2.25 2.25 0 0 1 4.5 16.5V7.5A2.25 2.25 0 0 1 6.75 5.25h6.75m2.25 0 3 3m-3-3v3H15.75\" />',
    'users': '<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M17 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2\" /><circle cx=\"9\" cy=\"7\" r=\"4\" /><path d=\"M23 20v-2a4 4 0 0 0-3-3.87\" /><path d=\"M16 3.13a4 4 0 0 1 0 7.75\" />',
    'globe': '<circle cx=\"12\" cy=\"12\" r=\"10\" /><path d=\"M2 12h20\" /><path d=\"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\" />',
    'server': '<rect x=\"2\" y=\"2\" width=\"20\" height=\"8\" rx=\"2\" /><rect x=\"2\" y=\"14\" width=\"20\" height=\"8\" rx=\"2\" /><path d=\"M6 6h.01\" /><path d=\"M6 18h.01\" />',
    'calendar': '<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M8 3v2m8-2v2M4 9h16M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z\" />',
    'inbox': '<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M20 13V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6\" /><path d=\"M3 13h4l2 3h6l2-3h4\" />',
    'exclamation-triangle': '<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M12 9v3m0 3h.01\" /><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M10.29 3.86l-8.3 14.34A1.5 1.5 0 0 0 3.29 21h17.42a1.5 1.5 0 0 0 1.3-2.8L13.71 3.86a1.5 1.5 0 0 0-2.42 0z\" />',
    'megaphone': '<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M3 11l18-5v12L3 13v8\" />',
    'paint-brush': '<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2V3z\" />',
    'chart-pie': '<path d=\"M11 2v10l-8.66 5A10 10 0 1 0 11 2z\" /><path d=\"M13 12h9A10 10 0 0 1 13 2z\" />',
    'cog': '<circle cx=\"12\" cy=\"12\" r=\"3\" /><path d=\"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V22a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V2a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H22a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z\" />',
    'share': '<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186z\" />',
    'ticket': '<path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z\" />'
  };
  const path = paths[name] || '';
  return `<svg ${attrs}>${path}</svg>`;
}