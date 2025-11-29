'use client'

import { useState, useEffect } from 'react'
import { 
  UsersIcon,
  CalendarIcon,
  DocumentIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  PhotoIcon,
  CloudIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { adminService, Family } from '../services/adminService'

interface FamiliesListProps {
  onFamilyClick?: (familyId: string) => void
}

export function FamiliesList({ onFamilyClick }: FamiliesListProps) {
  const [families, setFamilies] = useState<Family[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null)
  const [showFamilyDetail, setShowFamilyDetail] = useState(false)

  useEffect(() => {
    loadFamilies()
  }, [])

  const loadFamilies = async () => {
    try {
      setLoading(true)
      const data = await adminService.getSocialMediaFamilies()
      setFamilies(data)
    } catch (error) {
      console.error('Error loading families:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFamilies = families.filter(family => {
    const matchesSearch = family.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (family.description && family.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                             (family.owner?.first_name && family.owner.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                             (family.owner?.last_name && family.owner.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && family.is_active) ||
                          (filterStatus === 'inactive' && !family.is_active)
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'green' : 'yellow'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'family': return '👨‍👩‍👧‍👦'
      case 'friends': return '👥'
      case 'sharehouse': return '🏠'
      default: return '❓'
    }
  }

  const handleFamilyClick = (family: Family) => {
    if (onFamilyClick) {
      onFamilyClick(family.id)
    } else {
      setSelectedFamily(family)
      setShowFamilyDetail(true)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Families Management</h2>
            <p className="text-lg text-gray-600 leading-relaxed">Manage and monitor all families in the system</p>
          </div>
          <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3">
            <PlusIcon className="h-5 w-5" />
            Add Family
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Families</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{families.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {families.filter(f => f.is_active).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Members</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {families.reduce((sum, f) => sum + f.member_count, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Inactive</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {families.filter(f => !f.is_active).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <MagnifyingGlassIcon className="h-4 w-4 inline mr-2" />
              Search
            </label>
            <input
              type="text"
              placeholder="Search families..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <FunnelIcon className="h-4 w-4 inline mr-2" />
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2">
              <FunnelIcon className="h-4 w-4" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Families Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Family</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Members</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFamilies.map((family) => (
                <tr key={family.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {family.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">{family.name}</div>
                        <div className="text-sm text-gray-500">{family.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {family.owner ? `${family.owner.first_name} ${family.owner.last_name}` : 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">{family.owner?.email || 'No email'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <UsersIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-semibold text-gray-900">{family.member_count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      family.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        family.is_active ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      {family.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="mr-2 text-lg">{getTypeIcon(family.type)}</span>
                      <span className="text-sm font-medium text-gray-700 capitalize">{family.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {new Date(family.updated_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleFamilyClick(family)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="View Family"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredFamilies.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <UsersIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No families found</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Family Detail Modal */}
      {showFamilyDetail && selectedFamily && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedFamily.name}</h3>
                <p className="text-sm text-gray-500">Family ID: {selectedFamily.id}</p>
              </div>
              <button
                onClick={() => setShowFamilyDetail(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Description</label>
                  <p className="text-gray-600">{selectedFamily.description || 'No description provided'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedFamily.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      selectedFamily.is_active ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    {selectedFamily.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Owner</label>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {selectedFamily.owner ? `${selectedFamily.owner.first_name} ${selectedFamily.owner.last_name}` : 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">{selectedFamily.owner?.email || 'No email'}</div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Member Count</label>
                  <div className="flex items-center">
                    <UsersIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-semibold text-gray-900 text-lg">{selectedFamily.member_count}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-4">Family Type</label>
                <div className="flex items-center">
                  <span className="mr-3 text-2xl">{getTypeIcon(selectedFamily.type)}</span>
                  <span className="text-lg font-medium text-gray-700 capitalize">{selectedFamily.type}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setShowFamilyDetail(false)}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors duration-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Navigate to family detail page
                  console.log('Navigate to family:', selectedFamily.id)
                  setShowFamilyDetail(false)
                }}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                View Family Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
