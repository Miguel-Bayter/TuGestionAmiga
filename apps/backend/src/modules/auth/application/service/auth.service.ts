import { LoginUseCase } from '@/modules/auth/application/use-case/login.usecase';
import { RegisterUseCase } from '@/modules/auth/application/use-case/register.usecase';

export class AuthService {
  constructor(
    private loginUseCase: LoginUseCase,
    private registerUseCase: RegisterUseCase
  ) {}

  async register(email: string, name: string, password: string) {
    return this.registerUseCase.execute(email, name, password);
  }

  async login(email: string, password: string) {
    return this.loginUseCase.execute(email, password);
  }
}
