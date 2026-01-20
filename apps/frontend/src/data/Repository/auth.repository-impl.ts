/**
 * Auth Repository Implementation
 * Concrete implementation of authentication operations
 */

import { API_ENDPOINTS } from '@/shared/config'
import type { IAuthRepository } from '@/domain/Repository/auth.repository'
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/shared/types'
import type { User } from '@/domain/Entity/user.entity'
import { axPrivate, axPublic, TokenManager } from '@/data/Provider'
import { loginResponseSchema, registerResponseSchema } from '@/data/Schema/auth.schema'

export class AuthRepository implements IAuthRepository {
  /**
   * Authenticate user with email and password
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await axPublic.post(API_ENDPOINTS.LOGIN, request)
    const validated = loginResponseSchema.parse(response.data)

    return validated
  }

  /**
   * Register a new user
   */
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const response = await axPublic.post(API_ENDPOINTS.REGISTER, request)
    const validated = registerResponseSchema.parse(response.data)

    return validated
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await axPrivate.get(API_ENDPOINTS.USER_PROFILE)
    return response.data as User
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await axPrivate.put(API_ENDPOINTS.USER_UPDATE, data)
    return response.data as User
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await axPrivate.post(API_ENDPOINTS.LOGOUT)
    } catch (error) {
      console.error('Logout endpoint error:', error)
    } finally {
      TokenManager.clearTokens()
    }
  }
}

/**
 * Singleton instance
 */
export const authRepository = new AuthRepository()
