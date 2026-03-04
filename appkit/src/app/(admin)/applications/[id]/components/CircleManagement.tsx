'use client'

import React from 'react'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  GripVerticalIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppCircle } from '../page'

interface CircleManagementProps {
  circles: AppCircle[];
  circlesLoading: boolean;
  circleMsg: string;
  draggingCircleId: string | null;
  onDragStart: (id: string | null) => void;
  onReparent: (id: string, parentId: string | null) => void;
  onOpenCreateDrawer: () => void;
  circleBillingMode: 'perCircleLevel' | 'perAccount' | undefined;
  onSaveBillingMode: (mode: 'perCircleLevel' | 'perAccount') => void;
  billingModeSaving: boolean;
  onRefresh?: () => void;
  onOpenDetail?: (id: string) => void;
  setActiveDevGuide?: (guide: string) => void;
}

export const CircleManagement: React.FC<CircleManagementProps> = ({
  circles,
  circlesLoading,
  circleMsg,
  draggingCircleId,
  onDragStart,
  onReparent,
  circleBillingMode,
  onSaveBillingMode,
  billingModeSaving,
  onOpenDetail,
}) => {
  const [expandedCircleIds, setExpandedCircleIds] = React.useState<string[]>([])

  const toggleExpanded = (id: string) => {
    setExpandedCircleIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const rootCircles = React.useMemo(() => circles.filter(c => !c.parentId), [circles])
  const circleChildrenMap = React.useMemo(() => {
    const map = new Map<string, AppCircle[]>()
    circles.forEach(c => {
      if (c.parentId) {
        const children = map.get(c.parentId) || []
        map.set(c.parentId, [...children, c])
      }
    })
    return map
  }, [circles])

  const renderCircleRows = (items: AppCircle[], depth = 0): React.ReactNode[] =>
    items.flatMap((circle) => {
      const children = circleChildrenMap.get(circle.id) || []
      const isExpanded = expandedCircleIds.includes(circle.id)
      const expandable = children.length > 0
      const depthPaddingClass = ['pl-3', 'pl-8', 'pl-12', 'pl-16', 'pl-20', 'pl-24'][Math.min(depth, 5)]

      const row = (
        <div
          key={circle.id}
          className={`group grid grid-cols-[minmax(0,1fr)_110px_80px_80px_130px_120px] gap-2 items-center ${depthPaddingClass} pr-3 py-2.5 border-b border-gray-100 dark:border-zinc-800/80 hover:bg-gray-50/70 dark:hover:bg-zinc-800/40 ${draggingCircleId === circle.id ? 'opacity-40' : ''}`}
          draggable
          onDragStart={() => onDragStart(circle.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            if (!draggingCircleId || draggingCircleId === circle.id) return
            onReparent(draggingCircleId, circle.id)
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {expandable ? (
              <button
                title="Toggle child circles"
                onClick={() => toggleExpanded(circle.id)}
                className="p-0.5 rounded hover:bg-gray-200/70 dark:hover:bg-zinc-700"
              >
                {isExpanded
                  ? <ChevronDownIcon className="w-3.5 h-3.5 text-gray-500" />
                  : <ChevronRightIcon className="w-3.5 h-3.5 text-gray-500" />}
              </button>
            ) : (
              <span className="w-4" />
            )}
            <GripVerticalIcon className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{circle.name}</p>
              <p className="text-[11px] text-gray-500 truncate">{circle.parentId ? 'Child circle' : 'Root circle'}</p>
            </div>
          </div>
          <div className="text-xs capitalize text-gray-600 dark:text-zinc-300">{circle.circleType}</div>
          <div className="text-xs text-gray-600 dark:text-zinc-300">{(circle.members || []).length}</div>
          <div className="text-xs text-gray-600 dark:text-zinc-300">{(circle.owners || []).length}</div>
          <div className="text-xs text-gray-600 dark:text-zinc-300">
            {circleBillingMode === 'perCircleLevel'
              ? `${(circle.billingAssignees || []).length} assignee(s)`
              : 'Per user'}
          </div>
          <div className="text-right">
            <Button size="sm" variant="outline" onClick={() => onOpenDetail?.(circle.id)}>Details</Button>
          </div>
        </div>
      )

      if (expandable && isExpanded) {
        return [row, ...renderCircleRows(children, depth + 1)]
      }
      return [row]
    })

  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-6 space-y-6">
      {circleMsg && <span className="text-xs text-red-500">{circleMsg}</span>}

      {/* Billing Mode */}
      <div className="rounded-lg border border-gray-200 dark:border-zinc-800">
        <div className="px-4 py-2 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Billing Mode</h4>
          <div className="flex items-center gap-2">
            <select
              title="Circle billing mode"
              value={circleBillingMode || 'perAccount'}
              onChange={(e) => onSaveBillingMode(e.target.value as 'perCircleLevel' | 'perAccount')}
              disabled={billingModeSaving}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg"
            >
              <option value="perAccount">Per Account</option>
              <option value="perCircleLevel">Per Circle Level</option>
            </select>
          </div>
        </div>
        <div className="p-4 text-xs text-gray-500 dark:text-zinc-400">
          {circleBillingMode === 'perCircleLevel'
            ? 'Billing is configured by circle-level assignee.'
            : 'Billing is configured per user account.'}
        </div>
      </div>

      {/* Circles Table */}
      <div className="rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
        {circlesLoading ? (
          <div className="p-6 text-sm text-gray-500">Loading circles...</div>
        ) : circles.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No circles created yet.</div>
        ) : (
          <>
            <div className="grid grid-cols-[minmax(0,1fr)_110px_80px_80px_130px_120px] gap-2 items-center px-3 py-2 text-[11px] font-semibold text-gray-500 bg-gray-50 dark:bg-zinc-800/60 uppercase tracking-wide">
              <div>Circle</div>
              <div>Type</div>
              <div>Members</div>
              <div>Owners</div>
              <div>Billing</div>
              <div className="text-right">Actions</div>
            </div>
            <div
              className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100 dark:border-zinc-800/80 bg-blue-50/40 dark:bg-blue-500/5"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                if (draggingCircleId) onReparent(draggingCircleId, null)
              }}
            >
              Drop here to move a circle to root level
            </div>
            <div>{renderCircleRows(rootCircles)}</div>
          </>
        )}
      </div>
    </div>
  )
}
