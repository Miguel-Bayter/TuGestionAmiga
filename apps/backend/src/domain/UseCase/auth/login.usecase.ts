import type { IAuthRepository } from '../../Repository/auth.repository';

export class LoginUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(email: string, password: string) {
    return this.authRepository.login(email, password);
  }
}
