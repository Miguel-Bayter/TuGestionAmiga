/**
 * Update Profile Use Case
 * Updates the current user's profile
 */

import { type IAuthRepository, type User } from '@/modules/auth/domain'

export class UpdateProfileUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(data: Partial<User>): Promise<User> {
    return this.authRepository.updateProfile(data)
  }
}
