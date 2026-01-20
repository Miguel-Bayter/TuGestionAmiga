/**
 * Login Use Case
 * Authenticates a user and stores tokens
 */

import type { IAuthRepository } from '@/domain/Repository/auth.repository'
import type { LoginRequest, LoginResponse } from '@/shared/types'

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  /**
   * Execute login flow
   */
  async execute(request: LoginRequest): Promise<LoginResponse> {
    return this.authRepository.login(request)
  }
}
