import { type AwilixContainer, createContainer, InjectionMode, asClass, asValue } from 'awilix';
import prisma from './database';

// Repositories - Implementations
import { AuthRepository } from '@/modules/auth/infrastructure/repository/auth.repository-impl';
import { BookRepository } from '@/modules/book/infrastructure/repository/book.repository-impl';

// Use Cases
import { LoginUseCase } from '@/modules/auth/application/use-case/login.usecase';
import { RegisterUseCase } from '@/modules/auth/application/use-case/register.usecase';
import { RefreshTokenUseCase } from '@/modules/auth/application/use-case/refresh-token.usecase';
import { ValidateTokenUseCase } from '@/modules/auth/application/use-case/validate-token.usecase';
import { GetAllBooksUseCase } from '@/modules/book/application/use-case/get-all-books.usecase';
import { GetBookByIdUseCase } from '@/modules/book/application/use-case/get-book-by-id.usecase';

// Services
import { AuthService } from '@/modules/auth/application/service/auth.service';
import { BookService } from '@/modules/book/application/service/book.service';

/**
 * Create and configure the IoC container of Awilix
 * Centralize the injection of all application dependencies
 */
export const container: AwilixContainer = createContainer({ injectionMode: InjectionMode.PROXY, strict: true });

// ============================================
// REGISTER PRIMITIVE VALUES (Infrastructure)
// ============================================
container.register({ prisma: asValue(prisma) });

// ============================================
// REGISTER REPOSITORIES (Data Layer)
// ============================================
container.register({
  authRepository: asClass(AuthRepository).scoped(),
  bookRepository: asClass(BookRepository).scoped(),
});

// ============================================
// REGISTER USE CASES (Domain Layer)
// ============================================
container.register({
  loginUseCase: asClass(LoginUseCase).singleton(),
  registerUseCase: asClass(RegisterUseCase).singleton(),
  refreshTokenUseCase: asClass(RefreshTokenUseCase).singleton(),
  validateTokenUseCase: asClass(ValidateTokenUseCase).singleton(),
  getAllBooksUseCase: asClass(GetAllBooksUseCase).singleton(),
  getBookByIdUseCase: asClass(GetBookByIdUseCase).singleton(),
});

// ============================================
// REGISTER SERVICES (Application Layer)
// ============================================
container.register({
  authService: asClass(AuthService).singleton(),
  bookService: asClass(BookService).singleton(),
});

export default container;
