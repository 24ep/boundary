/**
 * Sync Status Indicator
 * Shows real-time synchronization status between web and mobile
 */

'use client'

import { useEffect, useState } from 'react'
import { useSocket } from '@/contexts/SocketContext'

export function useSyncStatus() {
  const { connected } = useSocket()
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    if (connected) {
      setLastSync(new Date())
    }
  }, [connected])

  return {
    connected,
    lastSync,
    status: connected ? 'synced' : 'offline',
  }
}

export function SyncStatusIndicator() {
  const { connected, lastSync } = useSyncStatus()

  if (!connected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-macos">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-xs font-medium text-yellow-700">Offline</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-macos">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span className="text-xs font-medium text-green-700">
        Synced{lastSync ? ` ${lastSync.toLocaleTimeString()}` : ''}
      </span>
    </div>
  )
}

