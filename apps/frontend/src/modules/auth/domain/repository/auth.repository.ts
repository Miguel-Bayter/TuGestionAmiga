/**
 * Auth Repository Interface
 * Contract for authentication operations
 */

import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/shared/domain/types'
import type { User } from '@/modules/auth/domain/entity/user.entity'

export interface IAuthRepository {
  /**
   * Authenticate user with email and password
   */
  login(request: LoginRequest): Promise<LoginResponse>

  /**
   * Register a new user
   */
  register(request: RegisterRequest): Promise<RegisterResponse>

  /**
   * Get current user profile
   */
  getProfile(): Promise<User>

  /**
   * Update user profile
   */
  updateProfile(data: Partial<User>): Promise<User>

  /**
   * Logout user
   */
  logout(): Promise<void>

  /**
   * Request password reset code
   */
  forgotPassword(email: string): Promise<{ demo_code?: string }>

  /**
   * Verify code and reset password
   */
  verifyPasswordCode(email: string, code: string, newPassword: string): Promise<void>
}
