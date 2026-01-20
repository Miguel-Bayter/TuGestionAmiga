/**
 * Register Use Case
 * Registers a new user
 */

import type { IAuthRepository } from '../../Repository'
import type { RegisterRequest, RegisterResponse } from '@/shared/types'

export class RegisterUseCase {
  constructor(private authRepository: IAuthRepository) {}

  /**
   * Execute registration flow
   */
  async execute(request: RegisterRequest): Promise<RegisterResponse> {
    return this.authRepository.register(request)
  }
}
