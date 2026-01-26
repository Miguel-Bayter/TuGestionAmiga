/**
 * Auth Repository Implementation
 * Concrete implementation of authentication operations
 */

import { API_ENDPOINTS } from '@/shared/application/config'
import type { IAuthRepository } from '@/modules/auth/domain/contract'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@/shared/domain/types'
import type { User } from '@/modules/auth/domain'
import { axPrivate, axPublic, TokenManager } from '@/shared/infrastructure/provider'
import {
  loginResponseSchema,
  registerResponseSchema,
} from '@/modules/auth/infrastructure/schema/auth.schema'

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

  /**
   * Request password reset code
   */
  async forgotPassword(email: string): Promise<{ demo_code?: string }> {
    const response = await axPublic.post(API_ENDPOINTS.PASSWORD_FORGOT, {
      correo: email,
    })
    return response.data
  }

  /**
   * Verify code and reset password
   */
  async verifyPasswordCode(email: string, code: string, newPassword: string): Promise<void> {
    await axPublic.post(API_ENDPOINTS.PASSWORD_RESET, {
      correo: email,
      code,
      new_password: newPassword,
    })
  }
}

/**
 * Singleton instance
 */
export const authRepository = new AuthRepository()
