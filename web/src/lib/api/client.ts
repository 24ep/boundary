import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { API_CONFIG } from '../config/api'

interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any
  }
}

interface ApiError {
  code: string
  message: string
  details?: any
}

class ApiClient {
  private instance: AxiosInstance
  private baseURL: string
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (error?: any) => void
  }> = []

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      async (config) => {
        try {
          const token = this.getAccessToken()
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        } catch (error) {
          console.error('Error in request interceptor:', error)
        }
        return config
      },
      (error) => {
        console.error('Request interceptor error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response
      },
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            }).then(() => {
              return this.instance(originalRequest)
            }).catch((err) => {
              return Promise.reject(err)
            })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const refreshToken = this.getRefreshToken()
            if (refreshToken) {
              const response = await this.refreshAccessToken(refreshToken)
              this.setAccessToken(response.data.data.accessToken)
              
              // Retry failed requests
              this.failedQueue.forEach(({ resolve }) => {
                resolve()
              })
              this.failedQueue = []

              return this.instance(originalRequest)
            } else {
              // No refresh token, redirect to login
              this.handleLogout()
              return Promise.reject(error)
            }
          } catch (refreshError) {
            // Refresh token failed, redirect to login
            this.handleLogout()
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refreshToken')
  }

  private setAccessToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('accessToken', token)
  }

  private async refreshAccessToken(refreshToken: string) {
    try {
      return await this.instance.post('/auth/refresh', { refreshToken })
    } catch (error) {
      console.error('Error refreshing token:', error)
      throw error
    }
  }

  private handleLogout(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    window.location.href = '/auth/login'
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          return {
            code: 'VALIDATION_ERROR',
            message: data?.message || 'Invalid request data',
            details: data?.details,
          }
        case 401:
          return {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          }
        case 403:
          return {
            code: 'FORBIDDEN',
            message: 'Access denied',
          }
        case 404:
          return {
            code: 'NOT_FOUND',
            message: 'Resource not found',
          }
        case 409:
          return {
            code: 'CONFLICT',
            message: 'Resource conflict',
          }
        case 422:
          return {
            code: 'VALIDATION_ERROR',
            message: data?.message || 'Validation failed',
            details: data?.details,
          }
        case 429:
          return {
            code: 'RATE_LIMIT',
            message: 'Too many requests',
          }
        case 500:
          return {
            code: 'SERVER_ERROR',
            message: 'Internal server error',
          }
        default:
          return {
            code: 'UNKNOWN_ERROR',
            message: data?.message || 'An unknown error occurred',
          }
      }
    } else if (error.request) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
      }
    } else {
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred',
      }
    }
  }

  // Public methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.get<ApiResponse<T>>(url, config)
      return response.data
    } catch (error) {
      const apiError = this.handleError(error)
      throw apiError
    }
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.post<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      const apiError = this.handleError(error)
      throw apiError
    }
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.put<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      const apiError = this.handleError(error)
      throw apiError
    }
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.patch<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      const apiError = this.handleError(error)
      throw apiError
    }
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.delete<ApiResponse<T>>(url, config)
      return response.data
    } catch (error) {
      const apiError = this.handleError(error)
      throw apiError
    }
  }

  async upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.post<ApiResponse<T>>(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      const apiError = this.handleError(error)
      throw apiError
    }
  }

  // Utility methods
  setBaseURL(url: string) {
    this.baseURL = url
    this.instance.defaults.baseURL = url
  }

  setAuthToken(token: string) {
    this.instance.defaults.headers.common.Authorization = `Bearer ${token}`
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token)
    }
  }

  removeAuthToken() {
    delete this.instance.defaults.headers.common.Authorization
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.instance.get('/health')
      return true
    } catch (error) {
      return false
    }
  }
}

export const apiClient = new ApiClient()
export default apiClient

