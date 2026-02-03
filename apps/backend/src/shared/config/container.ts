import { type AwilixContainer, createContainer, InjectionMode, asClass, asValue } from 'awilix';
import prisma from '@/shared/config/database';

// Repositories - Implementations
import { AuthRepository } from '@/modules/auth/infrastructure/repository/auth.repository-impl';
import { BookRepository } from '@/modules/book/infrastructure/repository/book.repository-impl';
import { CategoryRepository } from '@/modules/category/infrastructure/repository/category.repository-impl';
import { UserRepository } from '@/modules/user/infrastructure/repository/user.repository-impl';

// Use Cases
import { LoginUseCase } from '@/modules/auth/application/use-case/login.usecase';
import { RegisterUseCase } from '@/modules/auth/application/use-case/register.usecase';
import { RefreshTokenUseCase } from '@/modules/auth/application/use-case/refresh-token.usecase';
import { ValidateTokenUseCase } from '@/modules/auth/application/use-case/validate-token.usecase';
import { GetAllBooksUseCase } from '@/modules/book/application/use-case/get-all-books.usecase';
import { GetBookByIdUseCase } from '@/modules/book/application/use-case/get-book-by-id.usecase';
import { GetAllCategoriesUseCase } from '@/modules/category/application/use-case/get-all-categories.usecase';
import { GetAllUsersUseCase } from '@/modules/user/application/use-case/get-all-users.usecase';

// Services
import { AuthService } from '@/modules/auth/application/service/auth.service';
import { BookService } from '@/modules/book/application/service/book.service';
import { CategoryService } from '@/modules/category/application/service/category.service';
import { UserService } from '@/modules/user/application/service/user.service';

/**
 * Create and configure the IoC container of Awilix
 * Centralize the injection of all application dependencies
 */
export const container: AwilixContainer = createContainer({
  injectionMode: InjectionMode.CLASSIC,
  strict: true,
});

// ============================================
// REGISTER PRIMITIVE VALUES (Infrastructure)
// ============================================
container.register({ prisma: asValue(prisma) });

// ============================================
// REGISTER REPOSITORIES (Data Layer)
// ============================================
container.register({
  authRepository: asClass(AuthRepository).singleton(),
  bookRepository: asClass(BookRepository).singleton(),
  categoryRepository: asClass(CategoryRepository).singleton(),
  userRepository: asClass(UserRepository).singleton(),
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
  getAllCategoriesUseCase: asClass(GetAllCategoriesUseCase).singleton(),
  getAllUsersUseCase: asClass(GetAllUsersUseCase).singleton(),
});

// ============================================
// REGISTER SERVICES (Application Layer)
// ============================================
container.register({
  authService: asClass(AuthService).singleton(),
  bookService: asClass(BookService).singleton(),
  categoryService: asClass(CategoryService).singleton(),
  userService: asClass(UserService).singleton(),
});

export default container;
