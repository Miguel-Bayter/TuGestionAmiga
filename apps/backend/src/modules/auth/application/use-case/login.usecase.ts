import type { IAuthRepository } from '@/modules/auth/domain/interface/auth.repository';

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(email: string, password: string) {
    return this.authRepository.login(email, password);
  }
}
