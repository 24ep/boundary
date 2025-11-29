'use client'

import { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon,
  BellIcon,
  AdjustmentsHorizontalIcon,
  UserCircleIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

interface HeaderProps {
  onGlobalSearch?: (query: string) => void
  onFilterClick?: () => void
  onLogout?: () => void
}

export function Header({ onGlobalSearch, onFilterClick, onLogout }: HeaderProps) {
  const [notifications, setNotifications] = useState(3)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [impersonating, setImpersonating] = useState<string | null>(null)

  // Read impersonation flag from local storage for display
  useEffect(() => {
    try {
      const id = localStorage.getItem('impersonate_user_id')
      setImpersonating(id)
      const handler = () => setImpersonating(localStorage.getItem('impersonate_user_id'))
      window.addEventListener('storage', handler)
      return () => window.removeEventListener('storage', handler)
    } catch {}
  }, [])

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications)
    if (notifications > 0) {
      setNotifications(0)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onGlobalSearch?.(searchQuery)
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Global Search */}
        <div className="flex-1 max-w-2xl">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search families, users, content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
          </form>
        </div>

        {/* Right side - Actions and User */}
        <div className="flex items-center space-x-4">
          {impersonating && (
            <div className="px-3 py-1.5 rounded-lg bg-yellow-100 text-yellow-800 text-xs font-semibold">
              Impersonating: {impersonating}
            </div>
          )}
          {/* Global Filters */}
          <button
            onClick={onFilterClick}
            className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            title="Global Filters"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors duration-200 relative"
              title="Notifications"
            >
              <BellIcon className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">New family registered</p>
                        <p className="text-xs text-gray-500 mt-1">Johnson Family just joined the platform</p>
                        <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">System update available</p>
                        <p className="text-xs text-gray-500 mt-1">Version 2.1.0 is ready for deployment</p>
                        <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Backup completed</p>
                        <p className="text-xs text-gray-500 mt-1">Daily backup completed successfully</p>
                        <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <button className="w-full text-sm text-red-600 hover:text-red-700 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@bondarys.com</p>
              </div>
              <ChevronDownIcon className="w-4 h-4 text-gray-400" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">A</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Admin User</p>
                      <p className="text-xs text-gray-500">admin@bondarys.com</p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <button className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                    <UserCircleIcon className="w-4 h-4 mr-3" />
                    Profile Settings
                  </button>
                  <button className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150">
                    <Cog6ToothIcon className="w-4 h-4 mr-3" />
                    Preferences
                  </button>
                  <hr className="my-2" />
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
