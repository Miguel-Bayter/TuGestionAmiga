/**
 * Get Profile Use Case
 * Fetches the current user's profile
 */

import { type IAuthRepository } from '@/modules/auth/domain'
import { type User } from '@/modules/user/domain'

export class GetProfileUseCase {
  constructor(private authRepository: IAuthRepository) {}

  /**
   * Execute get profile flow
   */
  async execute(): Promise<User> {
    return this.authRepository.getProfile()
  }
}
