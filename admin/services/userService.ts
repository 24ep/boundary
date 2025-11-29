// Mobile App Users API Service
import { API_BASE_URL } from './apiConfig'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  dateOfBirth?: string
  userType: 'hourse' | 'children' | 'seniors'
  subscriptionTier: 'free' | 'premium' | 'elite'
  familyIds: string[]
  isOnboardingComplete: boolean
  preferences: {
    notifications: boolean
    locationSharing: boolean
    popupSettings: {
      enabled: boolean
      frequency: 'daily' | 'weekly' | 'monthly'
      maxPerDay: number
      categories: string[]
    }
  }
  role: 'admin' | 'moderator' | 'user' | 'family_admin'
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  isVerified: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
  familyId?: string
  familyName?: string
  permissions: string[]
  location?: string
  timezone?: string
}

export interface Family {
  id: string
  name: string
  description: string
  memberCount: number
}

class UserService {
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
        if (response.status === 401) {
          // Clear invalid token
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_user')
          console.warn('Authentication token expired or invalid')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Mobile App Users
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users')
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`)
  }

  async createUser(userData: Partial<User>): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    })
  }

  async updateUserStatus(id: string, status: string): Promise<User> {
    return this.request<User>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }

  // Families
  async getFamilies(): Promise<Family[]> {
    return this.request<Family[]>('/families')
  }

  async getFamily(id: string): Promise<Family> {
    return this.request<Family>(`/families/${id}`)
  }

  async createFamily(familyData: Partial<Family>): Promise<Family> {
    return this.request<Family>('/families', {
      method: 'POST',
      body: JSON.stringify(familyData),
    })
  }

  async updateFamily(id: string, familyData: Partial<Family>): Promise<Family> {
    return this.request<Family>(`/families/${id}`, {
      method: 'PUT',
      body: JSON.stringify(familyData),
    })
  }

  async deleteFamily(id: string): Promise<void> {
    return this.request<void>(`/families/${id}`, {
      method: 'DELETE',
    })
  }
}

export const userService = new UserService()
