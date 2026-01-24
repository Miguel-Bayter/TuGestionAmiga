import type { IAuthRepository } from '@/modules/auth/domain/interface/auth.repository';

export class RegisterUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(email: string, name: string, password: string) {
    return this.authRepository.register(email, name, password);
  }
}
