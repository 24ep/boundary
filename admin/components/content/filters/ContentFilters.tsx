'use client'

import React, { useEffect, useState } from 'react'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline'
import { useContentContext } from '../providers/ContentProvider'
import { Card, CardBody } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { Select } from '../../ui/Select'
import { Button } from '../../ui/Button'
import { Badge } from '../../ui/Badge'
import { XMarkIcon } from '@heroicons/react/24/outline'

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
    <Card variant="frosted">
      <CardBody>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
              <Input
                type="text"
                placeholder="Search content..."
                value={state.searchTerm}
                onChange={(e) => actions.setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={state.filterType}
              onChange={(e) => actions.setFilterType(e.target.value)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'marketing', label: 'Marketing' },
                { value: 'news', label: 'News' },
                { value: 'inspiration', label: 'Inspiration' },
                { value: 'popup', label: 'Popup' }
              ]}
            />
            <Select
              value={state.filterStatus}
              onChange={(e) => actions.setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Published' },
                { value: 'archived', label: 'Archived' }
              ]}
            />
            <Select
              value={(state as any).filterRoute || ''}
              onChange={(e) => (actions as any).setFilterRoute ? (actions as any).setFilterRoute(e.target.value) : undefined}
              options={[
                { value: '', label: 'All Routes' },
                ...routes.map((r) => ({ value: r, label: r }))
              ]}
            />
            <Select
              value={state.sortBy}
              onChange={(e) => actions.setSortBy(e.target.value)}
              options={[
                { value: 'updatedAt-desc', label: 'Last Updated' },
                { value: 'createdAt-desc', label: 'Date Created' },
                { value: 'title-asc', label: 'Title A-Z' },
                { value: 'title-desc', label: 'Title Z-A' },
                { value: 'status-asc', label: 'Status' },
                { value: 'type-asc', label: 'Type' }
              ]}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">View:</span>
            <div className="flex border border-gray-300/50 rounded-lg overflow-hidden shadow-sm">
              <Button
                variant={state.viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => actions.setViewMode('grid')}
                className="rounded-none border-r border-gray-300/50"
                aria-label="Grid View"
              >
                <Squares2X2Icon className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant={state.viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => actions.setViewMode('list')}
                className="rounded-none"
                aria-label="List View"
              >
                <ListBulletIcon className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(state.searchTerm || state.filterType !== 'all' || state.filterStatus !== 'all' || (state as any).filterRoute) && (
          <div className="mt-4 pt-4 border-t border-gray-200/50 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Active filters:</span>
            {state.searchTerm && (
              <Badge variant="info" size="sm" className="gap-1.5">
                Search: "{state.searchTerm}"
                <button
                  onClick={() => actions.setSearchTerm('')}
                  className="ml-1 hover:opacity-70 transition-opacity"
                  aria-label="Clear search"
                >
                  <XMarkIcon className="h-3 w-3" aria-hidden="true" />
                </button>
              </Badge>
            )}
            {state.filterType !== 'all' && (
              <Badge variant="success" size="sm" className="gap-1.5">
                Type: {state.filterType}
                <button
                  onClick={() => actions.setFilterType('all')}
                  className="ml-1 hover:opacity-70 transition-opacity"
                  aria-label="Clear type filter"
                >
                  <XMarkIcon className="h-3 w-3" aria-hidden="true" />
                </button>
              </Badge>
            )}
            {state.filterStatus !== 'all' && (
              <Badge variant="warning" size="sm" className="gap-1.5">
                Status: {state.filterStatus}
                <button
                  onClick={() => actions.setFilterStatus('all')}
                  className="ml-1 hover:opacity-70 transition-opacity"
                  aria-label="Clear status filter"
                >
                  <XMarkIcon className="h-3 w-3" aria-hidden="true" />
                </button>
              </Badge>
            )}
            {(state as any).filterRoute && (
              <Badge variant="info" size="sm" className="gap-1.5">
                Route: {(state as any).filterRoute}
                <button
                  onClick={() => (actions as any).setFilterRoute?.('')}
                  className="ml-1 hover:opacity-70 transition-opacity"
                  aria-label="Clear route filter"
                >
                  <XMarkIcon className="h-3 w-3" aria-hidden="true" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  )
}
