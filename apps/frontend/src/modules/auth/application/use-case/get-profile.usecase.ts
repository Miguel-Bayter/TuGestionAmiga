/**
 * Get Profile Use Case
 * Fetches the current user's profile
 */

import { type IAuthRepository, type User } from '@/modules/auth/domain'

export class GetProfileUseCase {
  constructor(private authRepository: IAuthRepository) {}

  /**
   * Execute get profile flow
   */
  async execute(): Promise<User> {
    return this.authRepository.getProfile()
  }
}
