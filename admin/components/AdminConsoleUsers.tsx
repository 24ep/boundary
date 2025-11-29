'use client'

import { useState, useEffect } from 'react'
import { 
  UserIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  KeyIcon,
  UserGroupIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { adminService, AdminUser, Role, Permission, UserGroup } from '../services/adminService'

export function AdminConsoleUsers() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'groups'>('users')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [userGroups, setUserGroups] = useState<UserGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'viewer',
    status: 'active',
    department: '',
    permissions: [] as string[]
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load data from API
      const [usersData, rolesData, permissionsData, userGroupsData] = await Promise.all([
        adminService.getAdminUsers(),
        adminService.getRoles(),
        adminService.getPermissions(),
        adminService.getUserGroups()
      ])

      setUsers(usersData)
      setRoles(rolesData)
      setPermissions(permissionsData)
      setUserGroups(userGroupsData)
    } catch (error) {
      console.error('Error loading admin console data:', error)
      // Show error message to user
      alert('Failed to load admin console data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleCreate = () => {
    setEditingUser(null)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'viewer',
      status: 'active',
      department: '',
      permissions: []
    })
    setShowForm(true)
  }

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user)
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      department: user.department || '',
      permissions: user.permissions
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      if (editingUser) {
        // Update existing user
        const updatedUser = await adminService.updateAdminUser(editingUser.id, formData)
        setUsers(prev => prev.map(user => 
          user.id === editingUser.id ? updatedUser : user
        ))
      } else {
        // Create new user
        const newUser = await adminService.createAdminUser(formData)
        setUsers(prev => [...prev, newUser])
      }
      setShowForm(false)
      setEditingUser(null)
    } catch (error) {
      console.error('Error saving admin user:', error)
      alert('Failed to save admin user. Please try again.')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this admin user?')) {
      try {
        await adminService.deleteAdminUser(id)
        setUsers(prev => prev.filter(user => user.id !== id))
      } catch (error) {
        console.error('Error deleting admin user:', error)
        alert('Failed to delete admin user. Please try again.')
      }
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updatedUser = await adminService.updateAdminUserStatus(id, status)
      setUsers(prev => prev.map(user => 
        user.id === id ? updatedUser : user
      ))
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Failed to update user status. Please try again.')
    }
  }

  const getRoleColor = (role: string) => {
    const roleData = roles.find(r => r.id === role)
    return roleData?.color || '#6B7280'
  }

  const getRoleName = (role: string) => {
    const roleData = roles.find(r => r.id === role)
    return roleData?.name || role
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green'
      case 'inactive': return 'gray'
      case 'pending': return 'yellow'
      case 'suspended': return 'red'
      default: return 'gray'
    }
  }

  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-number text-blue-600">{users.length}</div>
          <div className="stat-label">Total Admins</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-green-600">
            {users.filter(user => user.status === 'active').length}
          </div>
          <div className="stat-label">Active Admins</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-yellow-600">
            {users.filter(user => user.status === 'pending').length}
          </div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-number text-purple-600">
            {users.filter(user => user.isVerified).length}
          </div>
          <div className="stat-label">Verified</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search admin users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
            
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="form-select w-auto"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select w-auto"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3 className="empty-state-title">
            {users.length === 0 ? 'No admin users available' : 'No admin users found'}
          </h3>
          <p className="empty-state-description">
            {users.length === 0 
              ? 'Unable to load admin users from the server. Please check your connection or contact support.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {users.length === 0 && (
            <div className="mt-4">
              <button 
                onClick={loadData}
                className="btn btn-primary"
              >
                Retry Loading Admin Users
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.firstName} className="h-10 w-10 rounded-full" />
                              ) : (
                                <UserIcon className="h-6 w-6 text-gray-500" />
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              {user.isVerified ? (
                                <ShieldCheckIcon className="h-4 w-4 text-green-500" />
                              ) : (
                                <ShieldExclamationIcon className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-1 mb-1">
                            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <PhoneIcon className="h-4 w-4 text-gray-400" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white"
                          style={{ backgroundColor: getRoleColor(user.role) }}
                        >
                          {getRoleName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full badge-${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                          <select
                            value={user.status}
                            onChange={(e) => handleStatusChange(user.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.department || 'No department'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin ? (
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Edit admin user"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete admin user"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderRolesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Roles & Permissions</h3>
          <p className="text-gray-600">Manage admin roles and their permissions</p>
        </div>
        <button className="btn btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: role.color }}
                  ></div>
                  <h4 className="text-lg font-semibold text-gray-900">{role.name}</h4>
                </div>
                {role.isSystem && (
                  <span className="badge badge-info">System</span>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">{role.description}</p>
              
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Permissions:</h5>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((permission) => (
                    <span key={permission} className="badge badge-secondary text-xs">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="btn btn-ghost text-blue-600 hover:text-blue-700">
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
                {!role.isSystem && (
                  <button className="btn btn-ghost text-red-600 hover:text-red-700">
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderGroupsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">User Groups</h3>
          <p className="text-gray-600">Organize admin users into groups with shared permissions</p>
        </div>
        <button className="btn btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userGroups.map((group) => (
          <div key={group.id} className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: group.color }}
                  ></div>
                  <h4 className="text-lg font-semibold text-gray-900">{group.name}</h4>
                </div>
                <span className="badge badge-info">{group.memberCount} members</span>
              </div>
              
              <p className="text-gray-600 mb-4">{group.description}</p>
              
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Group Permissions:</h5>
                <div className="flex flex-wrap gap-1">
                  {group.permissions.map((permission) => (
                    <span key={permission} className="badge badge-secondary text-xs">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="btn btn-ghost text-blue-600 hover:text-blue-700">
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button className="btn btn-ghost text-red-600 hover:text-red-700">
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingUser ? 'Edit Admin User' : 'Create Admin User'}
          </h2>
          <button
            onClick={() => setShowForm(false)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="form-select"
                    required
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="form-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Update Admin User' : 'Create Admin User'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🔐 Admin Console Users</h2>
          <p className="text-gray-600">Manage admin console users, roles, and permissions</p>
        </div>
        {activeTab === 'users' && (
          <button onClick={handleCreate} className="btn btn-primary">
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add Admin User
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserIcon className="h-5 w-5 inline mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'roles'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <KeyIcon className="h-5 w-5 inline mr-2" />
            Roles & Permissions
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'groups'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <UserGroupIcon className="h-5 w-5 inline mr-2" />
            User Groups
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && renderUsersTab()}
      {activeTab === 'roles' && renderRolesTab()}
      {activeTab === 'groups' && renderGroupsTab()}
    </div>
  )
}
