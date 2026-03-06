'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardBody } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { organizationService, OrgInvite } from '@/services/organizationService'
import {
  LinkIcon,
  PlusIcon,
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

function formatExpiry(expiresAt: string | null): string {
  if (!expiresAt) return 'Never'
  const d = new Date(expiresAt)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}

function InviteRow({ invite, baseUrl }: { invite: OrgInvite; baseUrl: string }) {
  const [copied, setCopied] = useState(false)
  const expired = isExpired(invite.expiresAt)
  const inactive = !invite.isActive || expired

  const copyLink = () => {
    const link = `${baseUrl}/onboarding?invite=${invite.code}`
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <tr className="border-b border-gray-100 dark:border-zinc-800 last:border-0">
      <td className="py-3 pr-4">
        <code className="font-mono text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded select-all">
          {invite.code}
        </code>
      </td>
      <td className="py-3 pr-4 text-sm text-gray-700 dark:text-gray-300 capitalize">{invite.role}</td>
      <td className="py-3 pr-4 text-sm text-gray-700 dark:text-gray-300">
        {invite.useCount}
        {invite.maxUses !== null ? ` / ${invite.maxUses}` : ' / ∞'}
      </td>
      <td className="py-3 pr-4 text-sm text-gray-700 dark:text-gray-300">{formatExpiry(invite.expiresAt)}</td>
      <td className="py-3 pr-4">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            inactive
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          }`}
        >
          {expired ? 'Expired' : invite.isActive ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="py-3 text-right">
        <button
          onClick={copyLink}
          disabled={inactive}
          className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Copy invite link"
        >
          {copied ? (
            <ClipboardDocumentCheckIcon className="w-4 h-4 text-green-500" />
          ) : (
            <ClipboardDocumentIcon className="w-4 h-4" />
          )}
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </td>
    </tr>
  )
}

export function InviteManagement() {
  const [invites, setInvites] = useState<OrgInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [role, setRole] = useState('admin')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const loadInvites = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await organizationService.listInvites()
      setInvites(data.invites)
    } catch (e: any) {
      setError(e.message || 'Failed to load invites')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInvites()
  }, [loadInvites])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    try {
      await organizationService.createInvite({
        role,
        ...(maxUses ? { maxUses: parseInt(maxUses, 10) } : {}),
        ...(expiresAt ? { expiresAt: new Date(expiresAt).toISOString() } : {}),
      })
      setShowForm(false)
      setRole('admin')
      setMaxUses('')
      setExpiresAt('')
      await loadInvites()
    } catch (e: any) {
      setFormError(e.message || 'Failed to generate invite')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <CardTitle>Invite Links</CardTitle>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
                Generate invite codes to let people join your organization.
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Generate Invite
          </Button>
        </div>
      </CardHeader>

      <CardBody>
        {showForm && (
          <form
            onSubmit={handleGenerate}
            className="mb-6 p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 space-y-4"
          >
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">New Invite</h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label htmlFor="inv-role">Role</Label>
                <select
                  id="inv-role"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full h-9 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-gray-100 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="inv-max-uses">Max Uses (blank = unlimited)</Label>
                <Input
                  id="inv-max-uses"
                  type="number"
                  min={1}
                  placeholder="e.g. 10"
                  value={maxUses}
                  onChange={e => setMaxUses(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="inv-expires">Expires At (optional)</Label>
                <Input
                  id="inv-expires"
                  type="date"
                  value={expiresAt}
                  onChange={e => setExpiresAt(e.target.value)}
                />
              </div>
            </div>

            {formError && (
              <p className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
                <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
                {formError}
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowForm(false); setFormError(null) }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Generating…' : 'Generate'}
              </Button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-gray-500 dark:text-zinc-400 py-4 text-center">Loading invites…</p>
        ) : error ? (
          <p className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 py-4">
            <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
            {error}
          </p>
        ) : invites.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-zinc-400 py-4 text-center">
            No invite links yet. Generate one to invite people to your organization.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-700">
                  <th className="pb-2 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider pr-4">Code</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider pr-4">Role</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider pr-4">Uses</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider pr-4">Expires</th>
                  <th className="pb-2 text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider pr-4">Status</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {invites.map(invite => (
                  <InviteRow key={invite.id} invite={invite} baseUrl={baseUrl} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
