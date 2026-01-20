/**
 * Update Profile Use Case
 * Updates the current user's profile
 */

import type { IAuthRepository } from '../../Repository'
import type { User } from '../../Entity'

export class UpdateProfileUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(data: Partial<User>): Promise<User> {
    return this.authRepository.updateProfile(data)
  }
}
