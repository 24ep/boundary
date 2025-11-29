// Admin Console API Service
import { API_BASE_URL } from './apiConfig'

export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  role: 'super_admin' | 'admin' | 'editor' | 'viewer'
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  isVerified: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
  permissions: string[]
  department?: string
  timezone?: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  color: string
  isSystem: boolean
}

export interface Permission {
  id: string
  name: string
  description: string
  category: string
}

export interface UserGroup {
  id: string
  name: string
  description: string
  memberCount: number
  permissions: string[]
  color: string
}

export interface Family {
  id: string
  name: string
  description?: string
  type: 'family' | 'friends' | 'sharehouse'
  invite_code?: string
  created_at: string
  updated_at: string
  owner_id: string
  is_active: boolean
  member_count: number
  owner?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
  members?: FamilyMember[]
}

export interface FamilyMember {
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  user: {
    id: string
    first_name: string
    last_name: string
    email: string
    avatar_url?: string
  }
}

class AdminService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const token = localStorage.getItem('admin_token')
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      // Return empty data instead of throwing error for better UX
      if (endpoint.includes('/admin/users')) {
        return [] as T
      }
      if (endpoint.includes('/admin/roles')) {
        return [] as T
      }
      if (endpoint.includes('/admin/permissions')) {
        return [] as T
      }
      if (endpoint.includes('/admin/user-groups')) {
        return [] as T
      }
      throw error
    }
  }

  // Impersonation (stub - depends on backend session support)
  async impersonateUser(userId: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/admin/impersonate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    try { localStorage.setItem('impersonate_user_id', userId) } catch {}
    return data
  }

  async stopImpersonation(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/admin/stop-impersonate`, { method: 'POST' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    try { localStorage.removeItem('impersonate_user_id') } catch {}
    return data
  }

  // Admin Users
  async getAdminUsers(): Promise<AdminUser[]> {
    return this.request<AdminUser[]>('/admin/users')
  }

  async getAdminUser(id: string): Promise<AdminUser> {
    return this.request<AdminUser>(`/admin/users/${id}`)
  }

  async createAdminUser(userData: Partial<AdminUser>): Promise<AdminUser> {
    return this.request<AdminUser>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateAdminUser(id: string, userData: Partial<AdminUser>): Promise<AdminUser> {
    return this.request<AdminUser>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async deleteAdminUser(id: string): Promise<void> {
    return this.request<void>(`/admin/users/${id}`, {
      method: 'DELETE',
    })
  }

  async updateAdminUserStatus(id: string, status: string): Promise<AdminUser> {
    return this.request<AdminUser>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  // Roles
  async getRoles(): Promise<Role[]> {
    return this.request<Role[]>('/admin/roles')
  }

  async getRole(id: string): Promise<Role> {
    return this.request<Role>(`/admin/roles/${id}`)
  }

  async createRole(roleData: Partial<Role>): Promise<Role> {
    return this.request<Role>('/admin/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    })
  }

  async updateRole(id: string, roleData: Partial<Role>): Promise<Role> {
    return this.request<Role>(`/admin/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    })
  }

  async deleteRole(id: string): Promise<void> {
    return this.request<void>(`/admin/roles/${id}`, {
      method: 'DELETE',
    })
  }

  // Permissions
  async getPermissions(): Promise<Permission[]> {
    return this.request<Permission[]>('/admin/permissions')
  }

  // User Groups
  async getUserGroups(): Promise<UserGroup[]> {
    return this.request<UserGroup[]>('/admin/user-groups')
  }

  async getUserGroup(id: string): Promise<UserGroup> {
    return this.request<UserGroup>(`/admin/user-groups/${id}`)
  }

  async createUserGroup(groupData: Partial<UserGroup>): Promise<UserGroup> {
    return this.request<UserGroup>('/admin/user-groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    })
  }

  async updateUserGroup(id: string, groupData: Partial<UserGroup>): Promise<UserGroup> {
    return this.request<UserGroup>(`/admin/user-groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(groupData),
    })
  }

  async deleteUserGroup(id: string): Promise<void> {
    return this.request<void>(`/admin/user-groups/${id}`, {
      method: 'DELETE',
    })
  }

  // Application Settings
  async getApplicationSettings(): Promise<{ settings: any[] }> {
    return this.request<{ settings: any[] }>('/admin/application-settings')
  }

  async upsertApplicationSetting(payload: {
    setting_key: string
    setting_value: any
    setting_type?: string
    category?: string
    description?: string
    is_public?: boolean
    is_editable?: boolean
  }): Promise<{ setting: any }> {
    return this.request<{ setting: any }>('/admin/application-settings', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  }

  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
    return this.request<{ token: string; user: AdminUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async logout(): Promise<void> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    })
  }

  async getCurrentUser(): Promise<AdminUser> {
    return this.request<AdminUser>('/auth/me')
  }

  // Families Management
  async getFamilies(): Promise<Family[]> {
    return this.request<Family[]>('/api/v1/families')
  }

  async getFamily(id: string): Promise<Family> {
    return this.request<Family>(`/api/v1/families/${id}`)
  }

  async createFamily(familyData: {
    name: string
    description?: string
    type: 'family' | 'friends' | 'sharehouse'
  }): Promise<Family> {
    return this.request<Family>('/api/v1/families', {
      method: 'POST',
      body: JSON.stringify(familyData),
    })
  }

  async updateFamily(id: string, familyData: Partial<Family>): Promise<Family> {
    return this.request<Family>(`/api/v1/families/${id}`, {
      method: 'PUT',
      body: JSON.stringify(familyData),
    })
  }

  async deleteFamily(id: string): Promise<void> {
    return this.request<void>(`/api/v1/families/${id}`, {
      method: 'DELETE',
    })
  }

  async getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
    return this.request<FamilyMember[]>(`/api/v1/families/${familyId}/members`)
  }

  async addFamilyMember(familyId: string, memberData: {
    user_id: string
    role: 'admin' | 'member'
  }): Promise<FamilyMember> {
    return this.request<FamilyMember>(`/api/v1/families/${familyId}/members`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    })
  }

  async removeFamilyMember(familyId: string, userId: string): Promise<void> {
    return this.request<void>(`/api/v1/families/${familyId}/members/${userId}`, {
      method: 'DELETE',
    })
  }

  async updateFamilyMemberRole(familyId: string, userId: string, role: 'admin' | 'member'): Promise<FamilyMember> {
    return this.request<FamilyMember>(`/api/v1/families/${familyId}/members/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
  }

  // Social Media Families (for admin dashboard)
  async getSocialMediaFamilies(): Promise<Family[]> {
    const response = await this.request<{ success: boolean; data: Family[] }>('/api/social-media/families')
    return response.data || []
  }

  // Safety Alerts
  async getSafetyAlertsCount(): Promise<number> {
    try {
      const response = await this.request<{ alerts: any[]; activeAlerts: number }>('/api/v1/safety/alerts')
      return response.activeAlerts || 0
    } catch (error) {
      console.error('Error fetching safety alerts count:', error)
      return 0
    }
  }

  // Safety Incidents
  async getSafetyIncidents(familyId?: string): Promise<any[]> {
    try {
      const endpoint = familyId ? `/api/v1/safety/incidents?family_id=${familyId}` : '/api/v1/safety/incidents'
      const response = await this.request<{ incidents: any[] }>(endpoint)
      return response.incidents || []
    } catch (error) {
      console.error('Error fetching safety incidents:', error)
      return []
    }
  }

  async getSafetyIncident(id: string): Promise<any> {
    try {
      const response = await this.request<any>(`/api/v1/safety/incidents/${id}`)
      return response
    } catch (error) {
      console.error('Error fetching safety incident:', error)
      throw error
    }
  }

  async acknowledgeSafetyIncident(id: string): Promise<any> {
    try {
      const response = await this.request<any>(`/api/v1/safety/incidents/${id}/acknowledge`, {
        method: 'PATCH'
      })
      return response
    } catch (error) {
      console.error('Error acknowledging safety incident:', error)
      throw error
    }
  }

  async resolveSafetyIncident(id: string): Promise<any> {
    try {
      const response = await this.request<any>(`/api/v1/safety/incidents/${id}/resolve`, {
        method: 'PATCH'
      })
      return response
    } catch (error) {
      console.error('Error resolving safety incident:', error)
      throw error
    }
  }

  // Tickets (placeholder - no backend endpoint yet)
  async getTicketsCount(): Promise<number> {
    // TODO: Implement when ticket management backend is ready
    // For now, return 0 to hide the badge
    return 0
  }
}

export const adminService = new AdminService()
