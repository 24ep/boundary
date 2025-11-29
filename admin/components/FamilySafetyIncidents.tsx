'use client'

import { useState, useEffect } from 'react'
import { 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  HeartIcon,
  HomeIcon,
  UserIcon,
  CalendarIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { adminService } from '../services/adminService'

interface Family {
  id: string
  name: string
  description: string
  memberCount: number
}

interface EmergencyIncident {
  id: string
  familyId: string
  userId: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    avatar?: string
  }
  type: 'panic' | 'medical' | 'safety' | 'weather' | 'geofence' | 'check-in'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'acknowledged' | 'resolved' | 'false_alarm'
  title: string
  message: string
  location: {
    latitude: number
    longitude: number
    address: string
    accuracy: number
  }
  timestamp: string
  acknowledgedBy?: string
  acknowledgedAt?: string
  resolvedAt?: string
  contacts: {
    id: string
    name: string
    phone: string
    relationship: string
    contacted: boolean
    contactedAt?: string
  }[]
  familyMembers: {
    id: string
    name: string
    role: string
    notified: boolean
    notifiedAt?: string
  }[]
  metadata: {
    deviceInfo?: string
    appVersion?: string
    batteryLevel?: number
    networkType?: string
  }
}

export function FamilySafetyIncidents() {
  const [families, setFamilies] = useState<Family[]>([])
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([])
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterFamily, setFilterFamily] = useState('all')
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Fetch real families data from API
      const familiesData = await adminService.getFamilies()
      const formattedFamilies: Family[] = familiesData.map(family => ({
        id: family.id,
        name: family.name,
        description: family.description || '',
        memberCount: family.member_count || 0
      }))
      setFamilies(formattedFamilies)
      
      // Load all incidents from all families
      await loadAllIncidents()
    } catch (error) {
      console.error('Error loading data:', error)
      // Fallback to empty arrays if API fails
      setFamilies([])
      setIncidents([])
    } finally {
      setLoading(false)
    }
  }

  const loadAllIncidents = async () => {
    try {
      // Fetch real safety incidents data from all families
      const incidentsData = await adminService.getSafetyIncidents()
      
      // Transform API data to match component interface
      const formattedIncidents: EmergencyIncident[] = incidentsData.map((incident: any) => ({
        id: incident.id,
        familyId: incident.family_id,
        userId: incident.user_id,
        user: {
          id: incident.user?.id || incident.user_id,
          firstName: incident.user?.first_name || 'Unknown',
          lastName: incident.user?.last_name || 'User',
          email: incident.user?.email || '',
          phone: incident.user?.phone || '',
          avatar: incident.user?.avatar_url || 'https://via.placeholder.com/40'
        },
        type: mapIncidentType(incident.type),
        severity: mapIncidentSeverity(incident.priority),
        status: mapIncidentStatus(incident.status),
        title: incident.title,
        message: incident.message || '',
        location: {
          latitude: incident.location_data?.latitude || 0,
          longitude: incident.location_data?.longitude || 0,
          address: incident.location_data?.address || 'Location not available',
          accuracy: incident.location_data?.accuracy || 0
        },
        timestamp: incident.created_at,
        acknowledgedBy: incident.acknowledged_by,
        acknowledgedAt: incident.acknowledged_at,
        resolvedAt: incident.resolved_at,
        contacts: incident.emergency_contacts || [],
        familyMembers: incident.family_members || [],
        metadata: {
          deviceInfo: incident.device_info,
          appVersion: incident.app_version,
          batteryLevel: incident.battery_level,
          networkType: incident.network_type
        }
      }))

      setIncidents(formattedIncidents)
    } catch (error) {
      console.error('Error loading incidents:', error)
      // Fallback to empty array if API fails
      setIncidents([])
    }
  }

  // Helper functions to map API data to component interface
  const mapIncidentType = (apiType: string): 'panic' | 'medical' | 'safety' | 'weather' | 'geofence' | 'check-in' => {
    switch (apiType) {
      case 'emergency': return 'panic'
      case 'check_in': return 'check-in'
      case 'location_alert': return 'geofence'
      case 'custom': return 'safety'
      default: return 'safety'
    }
  }

  const mapIncidentSeverity = (apiPriority: string): 'low' | 'medium' | 'high' | 'critical' => {
    switch (apiPriority) {
      case 'urgent': return 'critical'
      case 'high': return 'high'
      case 'medium': return 'medium'
      case 'low': return 'low'
      default: return 'medium'
    }
  }

  const mapIncidentStatus = (apiStatus: string): 'active' | 'acknowledged' | 'resolved' | 'false_alarm' => {
    switch (apiStatus) {
      case 'active': return 'active'
      case 'resolved': return 'resolved'
      case 'cancelled': return 'false_alarm'
      default: return 'active'
    }
  }

  const handleIncidentClick = (incident: EmergencyIncident) => {
    setSelectedIncident(incident)
    setShowDetails(true)
  }

  const handleAcknowledgeIncident = async (incidentId: string) => {
    try {
      await adminService.acknowledgeSafetyIncident(incidentId)
      
      setIncidents(prev => prev.map(incident => 
        incident.id === incidentId 
          ? { 
              ...incident, 
              status: 'acknowledged' as const,
              acknowledgedBy: 'Admin',
              acknowledgedAt: new Date().toISOString()
            }
          : incident
      ))
      
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident(prev => prev ? {
          ...prev,
          status: 'acknowledged' as const,
          acknowledgedBy: 'Admin',
          acknowledgedAt: new Date().toISOString()
        } : null)
      }
    } catch (error) {
      console.error('Error acknowledging incident:', error)
      // You could show a toast notification here
    }
  }

  const handleResolveIncident = async (incidentId: string) => {
    try {
      await adminService.resolveSafetyIncident(incidentId)
      
      setIncidents(prev => prev.map(incident => 
        incident.id === incidentId 
          ? { 
              ...incident, 
              status: 'resolved' as const,
              resolvedAt: new Date().toISOString()
            }
          : incident
      ))
      
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident(prev => prev ? {
          ...prev,
          status: 'resolved' as const,
          resolvedAt: new Date().toISOString()
        } : null)
      }
    } catch (error) {
      console.error('Error resolving incident:', error)
      // You could show a toast notification here
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100'
      case 'acknowledged': return 'text-yellow-600 bg-yellow-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      case 'false_alarm': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'panic': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      case 'medical': return <HeartIcon className="h-5 w-5 text-red-500" />
      case 'safety': return <ShieldCheckIcon className="h-5 w-5 text-orange-500" />
      case 'weather': return <BellIcon className="h-5 w-5 text-blue-500" />
      case 'geofence': return <MapPinIcon className="h-5 w-5 text-green-500" />
      case 'check-in': return <ClockIcon className="h-5 w-5 text-blue-500" />
      default: return <BellIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || incident.type === filterType
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus
    const matchesFamily = filterFamily === 'all' || incident.familyId === filterFamily
    
    return matchesSearch && matchesType && matchesStatus && matchesFamily
  })

  const getFamilyName = (familyId: string) => {
    const family = families.find(f => f.id === familyId)
    return family?.name || 'Unknown Family'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🚨 Family Safety Incidents</h2>
          <p className="text-gray-600">Monitor and manage emergency incidents across all families</p>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-number text-red-600">
            {incidents.filter(i => i.status === 'active').length}
          </div>
          <div className="stat-label">Active Incidents</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-orange-600">
            {incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length}
          </div>
          <div className="stat-label">High Priority</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-yellow-600">
            {incidents.filter(i => i.status === 'acknowledged').length}
          </div>
          <div className="stat-label">Acknowledged</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-green-600">
            {incidents.filter(i => i.status === 'resolved').length}
          </div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search incidents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>
            <select
              value={filterFamily}
              onChange={(e) => setFilterFamily(e.target.value)}
              className="form-select w-auto"
            >
              <option value="all">All Families</option>
              {families.map(family => (
                <option key={family.id} value={family.id}>
                  {family.name}
                </option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="form-select w-auto"
            >
              <option value="all">All Types</option>
              <option value="panic">Panic</option>
              <option value="medical">Medical</option>
              <option value="safety">Safety</option>
              <option value="weather">Weather</option>
              <option value="geofence">Geofence</option>
              <option value="check-in">Check-in</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select w-auto"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
              <option value="false_alarm">False Alarm</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">
            Emergency Incidents ({filteredIncidents.length})
          </h3>
        </div>
            <div className="card-body p-0">
              {filteredIncidents.length === 0 ? (
                <div className="text-center py-12">
                  <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
                  <p className="text-gray-500">No emergency incidents match your current filters.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredIncidents.map((incident) => (
                    <div
                      key={incident.id}
                      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleIncidentClick(incident)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            {getTypeIcon(incident.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {incident.title}
                              </h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(incident.severity)}`}>
                                {incident.severity}
                              </span>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(incident.status)}`}>
                                {incident.status}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-3">{incident.message}</p>
                            
                            <div className="flex items-center space-x-6 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <UserIcon className="h-4 w-4" />
                                <span>{incident.user.firstName} {incident.user.lastName}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <UserGroupIcon className="h-4 w-4" />
                                <span>{getFamilyName(incident.familyId)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPinIcon className="h-4 w-4" />
                                <span>{incident.location.address}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <ClockIcon className="h-4 w-4" />
                                <span>{getRelativeTime(incident.timestamp)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <PhoneIcon className="h-4 w-4" />
                                <span>{incident.contacts.length} contacts</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleIncidentClick(incident)
                            }}
                            className="btn btn-ghost text-blue-600 hover:text-blue-700"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {incident.status === 'active' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAcknowledgeIncident(incident.id)
                              }}
                              className="btn btn-ghost text-yellow-600 hover:text-yellow-700"
                            >
                              <BellIcon className="h-4 w-4" />
                            </button>
                          )}
                          {incident.status === 'acknowledged' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleResolveIncident(incident.id)
                              }}
                              className="btn btn-ghost text-green-600 hover:text-green-700"
                            >
                              <ShieldCheckIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

      {/* Incident Details Modal */}
      {showDetails && selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedIncident.title}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(selectedIncident.severity)}`}>
                      {selectedIncident.severity}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedIncident.status)}`}>
                      {selectedIncident.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatTime(selectedIncident.timestamp)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* User Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">User Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedIncident.user.avatar || 'https://via.placeholder.com/60'}
                      alt={selectedIncident.user.firstName}
                      className="h-12 w-12 rounded-full"
                    />
                    <div>
                      <h5 className="font-medium text-gray-900">
                        {selectedIncident.user.firstName} {selectedIncident.user.lastName}
                      </h5>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <UserGroupIcon className="h-4 w-4" />
                          <span>{getFamilyName(selectedIncident.familyId)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <EnvelopeIcon className="h-4 w-4" />
                          <span>{selectedIncident.user.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DevicePhoneMobileIcon className="h-4 w-4" />
                          <span>{selectedIncident.user.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Incident Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Incident Details</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 mb-4">{selectedIncident.message}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Type:</span>
                      <span className="ml-2 text-gray-600 capitalize">{selectedIncident.type}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Severity:</span>
                      <span className="ml-2 text-gray-600 capitalize">{selectedIncident.severity}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Status:</span>
                      <span className="ml-2 text-gray-600 capitalize">{selectedIncident.status}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Timestamp:</span>
                      <span className="ml-2 text-gray-600">{formatTime(selectedIncident.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Location Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPinIcon className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-900">Address:</span>
                  </div>
                  <p className="text-gray-700 mb-3">{selectedIncident.location.address}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Latitude:</span>
                      <span className="ml-2 text-gray-600">{selectedIncident.location.latitude}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Longitude:</span>
                      <span className="ml-2 text-gray-600">{selectedIncident.location.longitude}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Accuracy:</span>
                      <span className="ml-2 text-gray-600">{selectedIncident.location.accuracy}m</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts */}
              {selectedIncident.contacts.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contacts</h4>
                  <div className="space-y-3">
                    {selectedIncident.contacts.map((contact) => (
                      <div key={contact.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">{contact.name}</h5>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <PhoneIcon className="h-4 w-4" />
                                <span>{contact.phone}</span>
                              </div>
                              <span>{contact.relationship}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              contact.contacted ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                            }`}>
                              {contact.contacted ? 'Contacted' : 'Not Contacted'}
                            </span>
                            {contact.contactedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                {formatTime(contact.contactedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Family Members */}
              {selectedIncident.familyMembers.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Family Members</h4>
                  <div className="space-y-3">
                    {selectedIncident.familyMembers.map((member) => (
                      <div key={member.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">{member.name}</h5>
                            <span className="text-sm text-gray-500">{member.role}</span>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              member.notified ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                            }`}>
                              {member.notified ? 'Notified' : 'Not Notified'}
                            </span>
                            {member.notifiedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                {formatTime(member.notifiedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Device Information */}
              {selectedIncident.metadata && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Device Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {selectedIncident.metadata.deviceInfo && (
                        <div>
                          <span className="font-medium text-gray-900">Device:</span>
                          <span className="ml-2 text-gray-600">{selectedIncident.metadata.deviceInfo}</span>
                        </div>
                      )}
                      {selectedIncident.metadata.appVersion && (
                        <div>
                          <span className="font-medium text-gray-900">App Version:</span>
                          <span className="ml-2 text-gray-600">{selectedIncident.metadata.appVersion}</span>
                        </div>
                      )}
                      {selectedIncident.metadata.batteryLevel && (
                        <div>
                          <span className="font-medium text-gray-900">Battery Level:</span>
                          <span className="ml-2 text-gray-600">{selectedIncident.metadata.batteryLevel}%</span>
                        </div>
                      )}
                      {selectedIncident.metadata.networkType && (
                        <div>
                          <span className="font-medium text-gray-900">Network:</span>
                          <span className="ml-2 text-gray-600">{selectedIncident.metadata.networkType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                {selectedIncident.status === 'active' && (
                  <button
                    onClick={() => {
                      handleAcknowledgeIncident(selectedIncident.id)
                      setShowDetails(false)
                    }}
                    className="btn btn-warning"
                  >
                    Acknowledge Incident
                  </button>
                )}
                {selectedIncident.status === 'acknowledged' && (
                  <button
                    onClick={() => {
                      handleResolveIncident(selectedIncident.id)
                      setShowDetails(false)
                    }}
                    className="btn btn-success"
                  >
                    Resolve Incident
                  </button>
                )}
                <button
                  onClick={() => setShowDetails(false)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
