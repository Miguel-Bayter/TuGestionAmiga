/**
 * Update Profile Use Case
 * Updates the current user's profile
 */

import type { IAuthRepository } from '@/domain/Repository/auth.repository'
import type { User } from '@/domain/Entity/user.entity'

export class UpdateProfileUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(data: Partial<User>): Promise<User> {
    return this.authRepository.updateProfile(data)
  }
}
