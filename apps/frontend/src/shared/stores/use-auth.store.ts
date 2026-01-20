/**
 * Authentication Store
 * Manages user authentication state and actions using Zustand
 */

import { create } from 'zustand'
import {
  LoginUseCase,
  RegisterUseCase,
  LogoutUseCase,
  GetProfileUseCase,
} from '@/domain/UseCase/auth'
import { authRepository } from '@/data/Repository/auth.repository-impl'
import { TokenManager } from '@/data/Provider'
import { STORAGE_KEYS } from '@/shared/config'
import type { User, LoginRequest, RegisterRequest } from '@/shared/types'

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
  getProfile: () => Promise<void>
}

// Initialize use cases
const loginUseCase = new LoginUseCase(authRepository)
const registerUseCase = new RegisterUseCase(authRepository)
const logoutUseCase = new LogoutUseCase(authRepository)
const getProfileUseCase = new GetProfileUseCase(authRepository)

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Login action
  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null })

    try {
      const response = await loginUseCase.execute(credentials)
      const { user, accessToken, refreshToken } = response

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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      set({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
        user: null,
      })
      return false
    }
  },

  // Register action
  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null })

    try {
      const response = await registerUseCase.execute(data)
      const { user, accessToken, refreshToken } = response

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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      set({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
        user: null,
      })
      return false
    }
  },

  // Logout action
  logout: async () => {
    set({ isLoading: true })

    try {
      await logoutUseCase.execute()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear tokens and user data
      TokenManager.clearTokens()

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
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

  // Get current user profile
  getProfile: async () => {
    set({ isLoading: true, error: null })

    try {
      const user = await getProfileUseCase.execute()
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
      set({
        user,
        isLoading: false,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile'
      set({
        isLoading: false,
        error: errorMessage,
      })
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },
}))
