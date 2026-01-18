/**
 * API Client
 * Typed HTTP client with JWT authentication and automatic token refresh
 */

import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS, HTTP_STATUS } from './constants'
import type { ApiError, RefreshTokenRequest, RefreshTokenResponse } from '@/types'

/**
 * Request configuration
 */
interface RequestConfig extends RequestInit {
  requiresAuth?: boolean
}

/**
 * API Response wrapper
 */
interface ApiResponse<T = unknown> {
  data?: T
  error?: ApiError
}

/**
 * Token management
 */
class TokenManager {
  private static refreshPromise: Promise<string | null> | null = null

  static getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  }

  static setAccessToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token)
  }

  static clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
  }

  /**
   * Refresh access token using refresh token
   * Prevents multiple simultaneous refresh requests
   */
  static async refreshAccessToken(): Promise<string | null> {
    // If a refresh is already in progress, wait for it
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performRefresh()
    const result = await this.refreshPromise
    this.refreshPromise = null

    return result
  }

  private static async performRefresh(): Promise<string | null> {
    const refreshToken = this.getRefreshToken()

    if (!refreshToken) {
      this.clearTokens()
      return null
    }

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REFRESH_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken } as RefreshTokenRequest),
      })

      if (!response.ok) {
        this.clearTokens()
        return null
      }

      const data: RefreshTokenResponse = await response.json()

      if (data.accessToken) {
        this.setAccessToken(data.accessToken)
        return data.accessToken
      }

      this.clearTokens()
      return null
    } catch (error) {
      console.error('Token refresh failed:', error)
      this.clearTokens()
      return null
    }
  }
}

/**
 * API Client class
 */
class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  /**
   * Build request headers
   */
  private buildHeaders(requiresAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (requiresAuth) {
      const token = TokenManager.getAccessToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    // Success responses
    if (response.ok) {
      // Handle 204 No Content
      if (response.status === 204) {
        return { data: undefined as T }
      }

      const data = await response.json()
      return { data }
    }

    // Error responses
    let errorMessage = 'An error occurred'
    let errorCode: string | undefined

    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
      errorCode = errorData.code
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage
    }

    const error: ApiError = {
      status: response.status,
      message: errorMessage,
      code: errorCode,
    }

    return { error }
  }

  /**
   * Make HTTP request
   */
  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { requiresAuth = false, ...fetchConfig } = config

    const url = `${this.baseURL}${endpoint}`
    const headers = this.buildHeaders(requiresAuth)

    try {
      // Initial request
      let response = await fetch(url, {
        ...fetchConfig,
        headers: {
          ...headers,
          ...fetchConfig.headers,
        },
      })

      // If unauthorized and requires auth, try to refresh token
      if (response.status === HTTP_STATUS.UNAUTHORIZED && requiresAuth) {
        const newToken = await TokenManager.refreshAccessToken()

        if (newToken) {
          // Retry request with new token
          const newHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
            ...fetchConfig.headers,
          }

          response = await fetch(url, {
            ...fetchConfig,
            headers: newHeaders,
          })
        } else {
          // Refresh failed, redirect to login
          window.location.href = '/login'
          return {
            error: {
              status: HTTP_STATUS.UNAUTHORIZED,
              message: 'Session expired. Please login again.',
            },
          }
        }
      }

      return this.handleResponse<T>(response)
    } catch (error) {
      console.error('API request failed:', error)
      return {
        error: {
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: error instanceof Error ? error.message : 'Network error',
        },
      }
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, requiresAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      requiresAuth,
    })
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: unknown,
    requiresAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      requiresAuth,
    })
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: unknown,
    requiresAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      requiresAuth,
    })
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: unknown,
    requiresAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      requiresAuth,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, requiresAuth: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      requiresAuth,
    })
  }
}

/**
 * Export singleton instance
 */
export const apiClient = new ApiClient(API_BASE_URL)

/**
 * Shorter alias for convenience
 */
export const api = apiClient

/**
 * Export token manager for use in stores
 */
export { TokenManager }

/**
 * Export types
 */
export type { ApiResponse, RequestConfig }
