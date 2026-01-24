import { LoginUseCase } from '@/modules/auth/application/use-case/login.usecase';
import { RegisterUseCase } from '@/modules/auth/application/use-case/register.usecase';
import { RefreshTokenUseCase } from '@/modules/auth/application/use-case/refresh-token.usecase';
import { ValidateTokenUseCase } from '@/modules/auth/application/use-case/validate-token.usecase';

export class AuthService {
  constructor(
    private loginUseCase: LoginUseCase,
    private registerUseCase: RegisterUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase,
    private validateTokenUseCase: ValidateTokenUseCase
  ) {}

  async register(email: string, name: string, password: string) {
    return this.registerUseCase.execute(email, name, password);
  }

  async login(email: string, password: string) {
    return this.loginUseCase.execute(email, password);
  }

  // Refresh the access token using a refresh token
  async refreshToken(token: string) {
    return this.refreshTokenUseCase.execute(token);
  }

  // Validate the provided token
  async validateToken(token: string) {
    return this.validateTokenUseCase.execute(token);
  }
}
