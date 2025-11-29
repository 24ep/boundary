'use client'

import { useEffect, useState } from 'react'

export function LocalizationManager() {
  const [terms, setTerms] = useState<{ key: string; value: string }[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    setTerms([
      { key: 'dashboard.title', value: 'Dashboard' },
      { key: 'users.title', value: 'Users' },
    ])
  }, [])

  const filtered = terms.filter(t => t.key.includes(search) || t.value.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Localization</h1>
        <p className="text-sm text-gray-600">Manage translations.</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <input placeholder="Search terms" value={search} onChange={(e) => setSearch(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 w-full" />
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Key</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Value</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filtered.map(t => (
              <tr key={t.key}>
                <td className="px-6 py-3 text-sm">{t.key}</td>
                <td className="px-6 py-3 text-sm">
                  <input className="border border-gray-200 rounded-lg px-2 py-1 w-full" value={t.value} onChange={(e) => setTerms(prev => prev.map(x => x.key === t.key ? { ...x, value: e.target.value } : x))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


