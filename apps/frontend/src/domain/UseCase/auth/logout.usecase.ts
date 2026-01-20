/**
 * Logout Use Case
 * Logs out a user and clears tokens
 */

import type { IAuthRepository } from '@/domain/Repository/auth.repository'

export class LogoutUseCase {
  constructor(private authRepository: IAuthRepository) {}

  /**
   * Execute logout flow
   */
  async execute(): Promise<void> {
    return this.authRepository.logout()
  }
}
