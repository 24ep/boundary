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
  ArrowLeftIcon,
  PencilIcon,
  SettingsIcon,
  BellIcon,
  LockClosedIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

interface FamilyMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'member' | 'child'
  avatar?: string
  joinedAt: string
  lastActive: string
  status: 'active' | 'inactive'
}

interface FamilyDetail {
  id: string
  name: string
  description: string
  memberCount: number
  createdAt: string
  lastActive: string
  status: 'active' | 'inactive' | 'suspended'
  owner: {
    id: string
    name: string
    email: string
  }
  settings: {
    privacy: 'public' | 'private' | 'family-only'
    notifications: boolean
    moderation: boolean
  }
  members: FamilyMember[]
}

interface FamilySidebarProps {
  familyId: string
  activeSection: string
  setActiveSection: (section: string) => void
}

function FamilySidebar({ familyId, activeSection, setActiveSection }: FamilySidebarProps) {
  const familySections = [
    {
      id: 'overview',
      label: 'Overview',
      icon: UsersIcon,
      color: 'text-blue-600'
    },
    {
      id: 'storage',
      label: 'Storage',
      icon: CloudIcon,
      color: 'text-orange-600'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: CalendarIcon,
      color: 'text-pink-600'
    },
    {
      id: 'content',
      label: 'Content',
      icon: DocumentIcon,
      color: 'text-purple-600'
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: DocumentIcon,
      color: 'text-teal-600'
    },
    {
      id: 'safety',
      label: 'Safety',
      icon: ShieldCheckIcon,
      color: 'text-red-600'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      color: 'text-gray-600'
    }
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Family Management</h3>
        <p className="text-sm text-gray-500">Family ID: {familyId}</p>
      </div>
      
      <nav className="p-4 space-y-1">
        {familySections.map((section) => {
          const Icon = section.icon
          const isActive = activeSection === section.id
          
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm' 
                  : 'hover:bg-gray-50 hover:shadow-sm'
                }
                group
              `}
            >
              <div className={`
                p-2 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-white shadow-sm' 
                  : 'group-hover:bg-white'
                }
              `}>
                <Icon className={`h-4 w-4 ${isActive ? section.color : 'text-gray-400 group-hover:' + section.color.replace('text-', 'text-')}`} />
              </div>
              <div className="flex-1 text-left">
                <div className={`font-medium text-sm transition-colors ${
                  isActive ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                }`}>
                  {section.label}
                </div>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

interface FamilyDetailProps {
  onBackToFamilies?: () => void
}

export function FamilyDetail({ onBackToFamilies }: FamilyDetailProps) {
  const [family, setFamily] = useState<FamilyDetail | null>(null)
  const [activeSection, setActiveSection] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFamilyData()
  }, [])

  const loadFamilyData = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API call
      const mockFamily: FamilyDetail = {
        id: '1',
        name: 'Johnson Family',
        description: 'The Johnson family from California',
        memberCount: 8,
        createdAt: '2024-01-15T10:30:00Z',
        lastActive: '2024-01-20T14:22:00Z',
        status: 'active',
        owner: {
          id: 'user1',
          name: 'John Johnson',
          email: 'john@johnsonfamily.com'
        },
        settings: {
          privacy: 'family-only',
          notifications: true,
          moderation: true
        },
        members: [
          {
            id: 'member1',
            name: 'John Johnson',
            email: 'john@johnsonfamily.com',
            role: 'owner',
            joinedAt: '2024-01-15T10:30:00Z',
            lastActive: '2024-01-20T14:22:00Z',
            status: 'active'
          },
          {
            id: 'member2',
            name: 'Sarah Johnson',
            email: 'sarah@johnsonfamily.com',
            role: 'admin',
            joinedAt: '2024-01-15T11:00:00Z',
            lastActive: '2024-01-20T12:15:00Z',
            status: 'active'
          },
          {
            id: 'member3',
            name: 'Mike Johnson',
            email: 'mike@johnsonfamily.com',
            role: 'member',
            joinedAt: '2024-01-16T09:30:00Z',
            lastActive: '2024-01-19T16:45:00Z',
            status: 'active'
          }
        ]
      }

      setFamily(mockFamily)
    } catch (error) {
      console.error('Error loading family data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderSectionContent = () => {
    if (!family) return null

    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Members</p>
                    <p className="text-2xl font-bold text-gray-800">{family.memberCount}</p>
                  </div>
                  <UsersIcon className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Members</p>
                    <p className="text-2xl font-bold text-green-600">
                      {family.members.filter(m => m.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircleIcon className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Family Status</p>
                    <p className="text-2xl font-bold text-blue-600 capitalize">{family.status}</p>
                  </div>
                  <ShieldCheckIcon className="h-8 w-8 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Family Members</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Last Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {family.members.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs">
                                {member.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-sm">{member.name}</div>
                              <div className="text-xs text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${member.role === 'owner' ? 'blue' : member.role === 'admin' ? 'green' : 'gray'}`}>
                            {member.role}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${member.status === 'active' ? 'green' : 'yellow'}`}>
                            {member.status}
                          </span>
                        </td>
                        <td>
                          <div className="text-sm text-gray-600">
                            {new Date(member.lastActive).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-ghost">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      case 'storage':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Family Storage</h3>
              <p className="text-gray-600">Storage management for {family.name}</p>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">4.5 GB of 10 GB used</p>
              </div>
            </div>
          </div>
        )

      case 'calendar':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Family Calendar</h3>
              <p className="text-gray-600">Event calendar for {family.name}</p>
            </div>
          </div>
        )

      case 'content':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Family Content</h3>
              <p className="text-gray-600">Content management for {family.name}</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Marketing Content</h4>
                  <p className="text-sm text-gray-600">Manage marketing materials and campaigns</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">News & Updates</h4>
                  <p className="text-sm text-gray-600">Family news and announcements</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                  <p className="text-sm text-gray-600">Family documents and files</p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Media Library</h4>
                  <p className="text-sm text-gray-600">Photos, videos, and other media</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'notes':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Family Notes</h3>
              <p className="text-gray-600">Notes and documentation for {family.name}</p>
            </div>
          </div>
        )

      case 'safety':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Family Safety</h3>
              <p className="text-gray-600">Safety settings and emergency contacts for {family.name}</p>
            </div>
          </div>
        )


      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Family Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Privacy</div>
                    <div className="text-sm text-gray-500">Current: {family.settings.privacy}</div>
                  </div>
                  <div className="flex items-center">
                    {family.settings.privacy === 'public' ? <GlobeAltIcon className="h-5 w-5 text-green-500" /> : 
                     family.settings.privacy === 'private' ? <LockClosedIcon className="h-5 w-5 text-yellow-500" /> :
                     <UsersIcon className="h-5 w-5 text-blue-500" />}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Notifications</div>
                    <div className="text-sm text-gray-500">Email notifications</div>
                  </div>
                  <div className="flex items-center">
                    {family.settings.notifications ? <BellIcon className="h-5 w-5 text-green-500" /> : 
                     <BellIcon className="h-5 w-5 text-gray-400" />}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Content Moderation</div>
                    <div className="text-sm text-gray-500">Automatic content filtering</div>
                  </div>
                  <div className="flex items-center">
                    {family.settings.moderation ? <ShieldCheckIcon className="h-5 w-5 text-green-500" /> : 
                     <ShieldCheckIcon className="h-5 w-5 text-gray-400" />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Section not found</div>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!family) {
    return (
      <div className="text-center py-12">
        <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Family not found</p>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Family Sidebar */}
      <FamilySidebar 
        familyId={family.id}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{family.name}</h2>
            <p className="text-gray-600">{family.description}</p>
          </div>
          <button 
            onClick={onBackToFamilies}
            className="btn btn-secondary flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Families
          </button>
        </div>

        {renderSectionContent()}
      </div>
    </div>
  )
}
