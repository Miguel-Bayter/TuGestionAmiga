/**
 * Logout Use Case
 * Logs out a user and clears tokens
 */

import type { IAuthRepository } from '../../Repository'

export class LogoutUseCase {
  constructor(private authRepository: IAuthRepository) {}

  /**
   * Execute logout flow
   */
  async execute(): Promise<void> {
    return this.authRepository.logout()
  }
}
