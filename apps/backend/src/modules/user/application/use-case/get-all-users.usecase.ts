import type { IUserRepository } from '@/modules/user/domain/interface/user.repository';

export class GetAllUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute() {
    return this.userRepository.getAll();
  }
}
