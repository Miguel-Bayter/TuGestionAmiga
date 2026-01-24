import type { IAuthRepository } from '@/modules/auth/domain/interface/auth.repository';

export class RefreshTokenUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(refreshToken: string) {
    return this.authRepository.refreshToken(refreshToken);
  }
}
