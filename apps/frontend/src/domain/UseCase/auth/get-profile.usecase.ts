/**
 * Get Profile Use Case
 * Fetches the current user's profile
 */

import type { IAuthRepository } from '@/domain/Repository/auth.repository'
import type { User } from '@/domain/Entity/user.entity'

export class GetProfileUseCase {
  constructor(private authRepository: IAuthRepository) {}

  /**
   * Execute get profile flow
   */
  async execute(): Promise<User> {
    return this.authRepository.getProfile()
  }
}
