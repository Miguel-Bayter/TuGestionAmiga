/**
 * Token Manager
 * Handles JWT token storage and refresh logic
 */

import axios from 'axios'
import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '@/shared/config'
import type { RefreshTokenResponse } from '@/shared/types'

/**
 * Token Manager Class
 * Manages access and refresh tokens with automatic refresh capability
 */
export class TokenManager {
  private static refreshPromise: Promise<string | null> | null = null

  /**
   * Get stored access token from localStorage
   */
  static getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  }

  /**
   * Get stored refresh token from localStorage
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  }

  /**
   * Store access token in localStorage
   */
  static setAccessToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
  }

  /**
   * Store refresh token in localStorage
   */
  static setRefreshToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token)
  }

  /**
   * Clear all stored tokens and user data
   */
  static clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
  }

  /**
   * Refresh access token using refresh token
   * Prevents multiple simultaneous refresh requests
   *
   * @returns New access token or null if refresh failed
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

  /**
   * Perform the actual token refresh
   * @private
   */
  private static async performRefresh(): Promise<string | null> {
    const refreshToken = this.getRefreshToken()

    if (!refreshToken) {
      this.clearTokens()
      return null
    }

    try {
      const response = await axios.post<RefreshTokenResponse>(
        `${API_BASE_URL}${API_ENDPOINTS.REFRESH_TOKEN}`,
        { refreshToken }
      )

      if (response.data.accessToken) {
        this.setAccessToken(response.data.accessToken)
        return response.data.accessToken
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
