/**
 * Login Use Case
 * Authenticates a user and stores tokens
 */

import type { IAuthRepository } from '@/modules/auth/domain'
import type { LoginRequest, LoginResponse } from '@/shared/domain/types'

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  /**
   * Execute login flow
   */
  async execute(request: LoginRequest): Promise<LoginResponse> {
    return this.authRepository.login(request)
  }
}
