'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../../../services/authService'
import { API_BASE_URL } from '../../../services/apiConfig'

interface AdminUser {
    id: string
    email: string
    first_name: string
    last_name: string
    role_name: string
    is_active: boolean
    last_login: string
    created_at: string
}

interface AdminRole {
    id: string
    name: string
    description: string
    permissions: string[]
}

export default function AdminUsersPage() {
    const router = useRouter()
    const [users, setUsers] = useState<AdminUser[]>([])
    const [roles, setRoles] = useState<AdminRole[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [createForm, setCreateForm] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        roleId: ''
    })
    const [createError, setCreateError] = useState('')
    const [createLoading, setCreateLoading] = useState(false)

    // Auth will be checked via API calls - if 401, will show error
    // Don't redirect here to avoid redirect loops

    // Fetch users and roles
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = authService.getToken()
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }

                const [usersRes, rolesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/admin/auth/users`, { headers }),
                    fetch(`${API_BASE_URL}/admin/auth/roles`, { headers })
                ])

                if (usersRes.ok) {
                    const usersData = await usersRes.json()
                    setUsers(usersData.users || [])
                } else {
                    setError('Failed to fetch users')
                }

                if (rolesRes.ok) {
                    const rolesData = await rolesRes.json()
                    setRoles(rolesData.roles || [])
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreateLoading(true)
        setCreateError('')

        try {
            const token = authService.getToken()
            const response = await fetch(`${API_BASE_URL}/admin/auth/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(createForm)
            })

            if (response.ok) {
                const data = await response.json()
                setUsers([...users, data.user])
                setShowCreateModal(false)
                setCreateForm({ email: '', password: '', firstName: '', lastName: '', roleId: '' })
            } else {
                const errData = await response.json()
                setCreateError(errData.error || 'Failed to create user')
            }
        } catch (err: any) {
            setCreateError(err.message || 'Failed to create user')
        } finally {
            setCreateLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900"
                        >
                            ← Back to Dashboard
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            + Create User
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
                )}

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.first_name} {user.last_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                            {user.role_name || 'No Role'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No admin users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                        <h2 className="text-xl font-bold mb-4">Create New Admin User</h2>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={createForm.email}
                                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={createForm.password}
                                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={createForm.firstName}
                                        onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={createForm.lastName}
                                        onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={createForm.roleId}
                                    onChange={(e) => setCreateForm({ ...createForm, roleId: e.target.value })}
                                >
                                    <option value="">Select a role...</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id}>{role.name} - {role.description}</option>
                                    ))}
                                </select>
                            </div>

                            {createError && (
                                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{createError}</div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {createLoading ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
