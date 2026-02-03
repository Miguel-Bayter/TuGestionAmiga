import { GetAllUsersUseCase } from '@/modules/user/application/use-case/get-all-users.usecase';

export class UserService {
  constructor(private getAllUsersUseCase: GetAllUsersUseCase) {}

  async getAll() {
    return this.getAllUsersUseCase.execute();
  }
}
