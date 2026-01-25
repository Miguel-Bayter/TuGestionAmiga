/**
 * Forgot Password Use Case
 * Handles password reset code generation
 */

import type { IAuthRepository } from '@/modules/auth/domain/repository/auth.repository'

export class ForgotPasswordUseCase {
  constructor(private authRepository: IAuthRepository) {}

  /**
   * Execute forgot password flow
   */
  async execute(email: string): Promise<{ demo_code?: string }> {
    return this.authRepository.forgotPassword(email)
  }
}
