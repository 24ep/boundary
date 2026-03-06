'use client'

import React, { useState } from 'react'
import { authService } from '@/services/authService'
import {
  MegaphoneIcon,
  BellIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

type MessageType = 'notification' | 'email' | 'both'
type Target = 'all' | 'premium' | 'active'

interface BroadcastTabProps {
  appId: string
}

export function BroadcastTab({ appId }: BroadcastTabProps) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<MessageType>('notification')
  const [target, setTarget] = useState<Target>('all')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) return
    setSubmitting(true)
    setResult(null)
    try {
      const token = authService.getToken()
      const res = await fetch('/api/v1/admin/broadcast', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title: title.trim(), message: message.trim(), type, target, applicationId: appId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send')
      setResult({ success: true, message: 'Broadcast sent successfully', count: data.results?.successful })
      setTitle('')
      setMessage('')
    } catch (e: any) {
      setResult({ success: false, message: e.message || 'Failed to send broadcast' })
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  return (
    <form onSubmit={handleSend} className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5 max-w-2xl">

      {/* Type selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Message Type</label>
        <div className="grid grid-cols-3 gap-3">
          {([
            { value: 'notification', label: 'Push Notification', icon: BellIcon },
            { value: 'email', label: 'Email', icon: EnvelopeIcon },
            { value: 'both', label: 'Both', icon: MegaphoneIcon },
          ] as const).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                type === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Target */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Audience</label>
        <select value={target} onChange={e => setTarget(e.target.value as Target)} className={inputCls}>
          <option value="all">All Users</option>
          <option value="active">Active Users</option>
          <option value="premium">Premium Subscribers</option>
        </select>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Notification title…"
          maxLength={100}
          required
          className={inputCls}
        />
        <p className="text-xs text-gray-400 text-right">{title.length}/100</p>
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Message *</label>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Write your message…"
          rows={5}
          maxLength={1000}
          required
          className={inputCls + ' resize-none'}
        />
        <p className="text-xs text-gray-400 text-right">{message.length}/1000</p>
      </div>

      {/* Result */}
      {result && (
        <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
          result.success
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
        }`}>
          {result.success
            ? <CheckCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
            : <ExclamationTriangleIcon className="w-4 h-4 shrink-0 mt-0.5" />}
          <span>
            {result.message}
            {result.count != null && ` · Reached ${result.count.toLocaleString()} user${result.count !== 1 ? 's' : ''}`}
          </span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !title.trim() || !message.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          <MegaphoneIcon className="w-4 h-4" />
          {submitting ? 'Sending…' : 'Send Broadcast'}
        </button>
      </div>
    </form>
  )
}
