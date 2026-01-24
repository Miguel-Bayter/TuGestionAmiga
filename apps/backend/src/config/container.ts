import { createContainer, InjectionMode, asClass, asValue } from 'awilix';
import type { AwilixContainer } from 'awilix';
import prisma from './database';

// Repositorios - Implementaciones
import { AuthRepository } from '@/data/Repository/auth.repository-impl';
import { BookRepository } from '@/modules/book/infrastructure/repositories/book.repository-impl';

// Use Cases
import { LoginUseCase, RegisterUseCase } from '@/domain/UseCase/auth';
import { GetAllBooksUseCase, GetBookByIdUseCase } from '@/domain/UseCase/book';

// Servicios
import { AuthService } from '@/services/auth.service';
import { BookService } from '@/modules/book/application/book.service';

/**
 * Crear y configurar el contenedor IoC de Awilix
 * Centraliza la inyección de todas las dependencias de la aplicación
 */
export const container: AwilixContainer = createContainer({ injectionMode: InjectionMode.PROXY, strict: true });

// ============================================
// REGISTRAR VALORES PRIMITIVOS (Infraestructura)
// ============================================
container.register({ prisma: asValue(prisma) });

// ============================================
// REGISTRAR REPOSITORIOS (Data Layer)
// ============================================
container.register({
  authRepository: asClass(AuthRepository).scoped(),
  bookRepository: asClass(BookRepository).scoped(),
});

// ============================================
// REGISTRAR USE CASES (Domain Layer)
// ============================================
container.register({
  loginUseCase: asClass(LoginUseCase).singleton(),
  registerUseCase: asClass(RegisterUseCase).singleton(),
  getAllBooksUseCase: asClass(GetAllBooksUseCase).singleton(),
  getBookByIdUseCase: asClass(GetBookByIdUseCase).singleton(),
});

// ============================================
// REGISTRAR SERVICIOS (Application Layer)
// ============================================
container.register({
  authService: asClass(AuthService).singleton(),
  bookService: asClass(BookService).singleton(),
});

export default container;
