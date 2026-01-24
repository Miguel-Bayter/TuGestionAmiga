import type { AuthUser } from '@/modules/auth/domain/entity/auth.entity';
import type { IAuthRepository } from '@/modules/auth/domain/interface/auth.repository';

export class ValidateTokenUseCase {
  constructor(private authRepository: IAuthRepository) {}

  async execute(token: string): Promise<AuthUser> {
    return this.authRepository.validateToken(token);
  }
}
