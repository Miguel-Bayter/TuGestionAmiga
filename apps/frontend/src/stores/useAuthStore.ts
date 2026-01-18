/**
 * Authentication Store
 * Manages user authentication state and actions
 */

import { create } from 'zustand'
import { apiClient, TokenManager } from '@/lib/api'
import { API_ENDPOINTS, STORAGE_KEYS } from '@/lib/constants'
import type { User, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/types'

interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginRequest) => Promise<boolean>
  register: (data: RegisterRequest) => Promise<boolean>
  logout: () => Promise<void>
  checkAuth: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Login action
  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null })

    const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.LOGIN, credentials)

    if (response.error) {
      set({
        isLoading: false,
        error: response.error.message,
        isAuthenticated: false,
        user: null,
      })
      return false
    }

    if (response.data) {
      const { user, accessToken, refreshToken } = response.data

      // Store tokens
      TokenManager.setAccessToken(accessToken)
      TokenManager.setRefreshToken(refreshToken)

      // Store user in localStorage for persistence
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      return true
    }

    set({ isLoading: false, error: 'Login failed' })
    return false
  },

  // Register action
  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null })

    const response = await apiClient.post<RegisterResponse>(API_ENDPOINTS.REGISTER, data)

    if (response.error) {
      set({
        isLoading: false,
        error: response.error.message,
        isAuthenticated: false,
        user: null,
      })
      return false
    }

    if (response.data) {
      const { user, accessToken, refreshToken } = response.data

      // Store tokens
      TokenManager.setAccessToken(accessToken)
      TokenManager.setRefreshToken(refreshToken)

      // Store user in localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      return true
    }

    set({ isLoading: false, error: 'Registration failed' })
    return false
  },

  // Logout action
  logout: async () => {
    set({ isLoading: true })

    // Optional: Call logout endpoint to invalidate refresh token on server
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT, {}, true)
    } catch (error) {
      console.error('Logout endpoint error:', error)
    }

    // Clear tokens and user data
    TokenManager.clearTokens()

    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  },

  // Check authentication status on app load
  checkAuth: () => {
    const token = TokenManager.getAccessToken()
    const userJson = localStorage.getItem(STORAGE_KEYS.USER)

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User
        set({
          user,
          isAuthenticated: true,
        })
      } catch (error) {
        console.error('Failed to parse user data:', error)
        TokenManager.clearTokens()
        set({
          user: null,
          isAuthenticated: false,
        })
      }
    } else {
      set({
        user: null,
        isAuthenticated: false,
      })
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },
}))
