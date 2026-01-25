/**
 * Verify Password Code Use Case
 * Handles password reset with code verification
 */

import type { IAuthRepository } from '@/modules/auth/domain/repository/auth.repository'

export class VerifyPasswordCodeUseCase {
  constructor(private authRepository: IAuthRepository) {}

  /**
   * Execute password reset flow
   */
  async execute(email: string, code: string, newPassword: string): Promise<void> {
    return this.authRepository.verifyPasswordCode(email, code, newPassword)
  }
}
