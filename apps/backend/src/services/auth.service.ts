import { LoginUseCase } from '../domain/UseCase/auth/login.usecase';
import { RegisterUseCase } from '../domain/UseCase/auth/register.usecase';

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
