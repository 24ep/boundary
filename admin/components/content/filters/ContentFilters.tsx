'use client'

import React, { useEffect, useState } from 'react'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline'
import { useContentContext } from '../providers/ContentProvider'

/**
 * Filters and search component for content management
 * Handles search, filtering, sorting, and view mode selection
 */
export const ContentFilters: React.FC = () => {
  const { state, actions } = useContentContext()
  const [routes, setRoutes] = useState<string[]>([])

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:3001'
        const res = await fetch(`${base}/api/mobile/routes`)
        const data = await res.json()
        setRoutes(data.routes || [])
      } catch {
        setRoutes([])
      }
    }
    loadRoutes()
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={state.searchTerm}
              onChange={(e) => actions.setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Type Filter */}
          <select
            value={state.filterType}
            onChange={(e) => actions.setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="all">All Types</option>
            <option value="marketing">Marketing</option>
            <option value="news">News</option>
            <option value="inspiration">Inspiration</option>
            <option value="popup">Popup</option>
          </select>

          {/* Status Filter */}
          <select
            value={state.filterStatus}
            onChange={(e) => actions.setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          {/* Route Filter */}
          <select
            value={(state as any).filterRoute || ''}
            onChange={(e) => (actions as any).setFilterRoute ? (actions as any).setFilterRoute(e.target.value) : undefined}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">All Routes</option>
            {routes.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={state.sortBy}
            onChange={(e) => actions.setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="updatedAt-desc">Last Updated</option>
            <option value="createdAt-desc">Date Created</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="status-asc">Status</option>
            <option value="type-asc">Type</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">View:</span>
          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => actions.setViewMode('grid')}
              className={`p-2 ${
                state.viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              } rounded-l-md transition-colors`}
              title="Grid View"
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => actions.setViewMode('list')}
              className={`p-2 ${
                state.viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              } rounded-r-md transition-colors`}
              title="List View"
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(state.searchTerm || state.filterType !== 'all' || state.filterStatus !== 'all' || (state as any).filterRoute) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {state.searchTerm && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{state.searchTerm}"
              <button
                onClick={() => actions.setSearchTerm('')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {state.filterType !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Type: {state.filterType}
              <button
                onClick={() => actions.setFilterType('all')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {state.filterStatus !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Status: {state.filterStatus}
              <button
                onClick={() => actions.setFilterStatus('all')}
                className="ml-1 text-yellow-600 hover:text-yellow-800"
              >
                ×
              </button>
            </span>
          )}
          {(state as any).filterRoute && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Route: {(state as any).filterRoute}
              <button
                onClick={() => (actions as any).setFilterRoute?.('')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
