/**
 * Authentication State Service
 * Manages user authentication state without external dependencies
 */

import {
  LoginUseCase,
  RegisterUseCase,
  LogoutUseCase,
  GetProfileUseCase,
} from '@/domain/UseCase/auth'
import { TokenManager } from '@/shared/infrastructure/provider'
import { STORAGE_KEYS } from '@/shared/application/config'
import type { User, LoginRequest, RegisterRequest } from '@/shared/domain/types'

interface AuthStateData {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export class AuthStateService {
  private state: AuthStateData = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }

  private subscribers: Set<(state: AuthStateData) => void> = new Set()

  constructor(
    private loginUseCase: LoginUseCase,
    private registerUseCase: RegisterUseCase,
    private logoutUseCase: LogoutUseCase,
    private getProfileUseCase: GetProfileUseCase
  ) {}

  async login(credentials: LoginRequest): Promise<boolean> {
    this.state.isLoading = true
    this.state.error = null
    this.notifySubscribers()

    try {
      const response = await this.loginUseCase.execute(credentials)
      const { user, accessToken, refreshToken } = response

      // Store tokens
      TokenManager.setAccessToken(accessToken)
      TokenManager.setRefreshToken(refreshToken)

      // Store user in localStorage for persistence
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

      this.state.user = user
      this.state.isAuthenticated = true
      this.state.isLoading = false
      this.state.error = null

      this.notifySubscribers()
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      this.state.isLoading = false
      this.state.error = errorMessage
      this.state.isAuthenticated = false
      this.state.user = null

      this.notifySubscribers()
      return false
    }
  }

  async register(data: RegisterRequest): Promise<boolean> {
    this.state.isLoading = true
    this.state.error = null
    this.notifySubscribers()

    try {
      const response = await this.registerUseCase.execute(data)
      const { user, accessToken, refreshToken } = response

      // Store tokens
      TokenManager.setAccessToken(accessToken)
      TokenManager.setRefreshToken(refreshToken)

      // Store user in localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

      this.state.user = user
      this.state.isAuthenticated = true
      this.state.isLoading = false
      this.state.error = null

      this.notifySubscribers()
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      this.state.isLoading = false
      this.state.error = errorMessage
      this.state.isAuthenticated = false
      this.state.user = null

      this.notifySubscribers()
      return false
    }
  }

  async logout(): Promise<void> {
    this.state.isLoading = true
    this.notifySubscribers()

    try {
      await this.logoutUseCase.execute()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear tokens and user data
      TokenManager.clearTokens()

      this.state.user = null
      this.state.isAuthenticated = false
      this.state.isLoading = false
      this.state.error = null

      this.notifySubscribers()
    }
  }

  checkAuth(): void {
    const token = TokenManager.getAccessToken()
    const userJson = localStorage.getItem(STORAGE_KEYS.USER)

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User
        this.state.user = user
        this.state.isAuthenticated = true
      } catch (error) {
        console.error('Failed to parse user data:', error)
        TokenManager.clearTokens()
        this.state.user = null
        this.state.isAuthenticated = false
      }
    } else {
      this.state.user = null
      this.state.isAuthenticated = false
    }

    this.notifySubscribers()
  }

  async getProfile(): Promise<void> {
    this.state.isLoading = true
    this.state.error = null
    this.notifySubscribers()

    try {
      const user = await this.getProfileUseCase.execute()
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
      this.state.user = user
      this.state.isLoading = false
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile'
      this.state.isLoading = false
      this.state.error = errorMessage
    }

    this.notifySubscribers()
  }

  clearError(): void {
    this.state.error = null
    this.notifySubscribers()
  }

  getState(): AuthStateData {
    return { ...this.state }
  }

  subscribe(listener: (state: AuthStateData) => void): () => void {
    this.subscribers.add(listener)
    listener(this.state)
    return () => {
      this.subscribers.delete(listener)
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((listener) => {
      listener({ ...this.state })
    })
  }
}
