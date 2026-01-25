/**
 * Auth Repository Interface
 * Contract for authentication operations
 */

import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '@/shared/types'
import { User } from '@/domain/Entity/user.entity'

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
}
