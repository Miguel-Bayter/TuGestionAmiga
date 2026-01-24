import { createContainer, InjectionMode, asClass, asValue } from 'awilix'
import type { AwilixContainer } from 'awilix'

// ===== Providers (HTTP clients & utilities) =====
import { axPublic, axPrivate, TokenManager } from '@/data/Provider'

// ===== Repositories =====
import { AuthRepository } from '@/data/Repository/auth.repository-impl'
import { BookRepository } from '@/data/Repository/book.repository-impl'
import { CartRepository } from '@/data/Repository/cart.repository-impl'
import { LoanRepository } from '@/data/Repository/loan.repository-impl'

// ===== Use Cases - Auth =====
import { LoginUseCase } from '@/domain/UseCase/auth/login.usecase'
import { RegisterUseCase } from '@/domain/UseCase/auth/register.usecase'
import { LogoutUseCase } from '@/domain/UseCase/auth/logout.usecase'
import { GetProfileUseCase } from '@/domain/UseCase/auth/get-profile.usecase'

// ===== Use Cases - Book =====
import { GetBooksUseCase } from '@/domain/UseCase/book/get-books.usecase'
import { GetBookUseCase } from '@/domain/UseCase/book/get-book.usecase'
import { GetAvailableBooksUseCase } from '@/domain/UseCase/book/get-available-books.usecase'
import { CreateBookUseCase } from '@/domain/UseCase/book/create-book.usecase'
import { UpdateBookUseCase } from '@/domain/UseCase/book/update-book.usecase'
import { DeleteBookUseCase } from '@/domain/UseCase/book/delete-book.usecase'

// ===== Use Cases - Cart =====
import { GetCartUseCase } from '@/domain/UseCase/cart/get-cart.usecase'
import { AddToCartUseCase } from '@/domain/UseCase/cart/add-to-cart.usecase'
import { RemoveFromCartUseCase } from '@/domain/UseCase/cart/remove-from-cart.usecase'
import { CheckoutUseCase } from '@/domain/UseCase/cart/checkout.usecase'

// ===== Use Cases - Loan =====
import { GetLoansUseCase } from '@/domain/UseCase/loan/get-loans.usecase'
import { CreateLoanUseCase } from '@/domain/UseCase/loan/create-loan.usecase'
import { ReturnLoanUseCase } from '@/domain/UseCase/loan/return-loan.usecase'
import { GetOverdueLoansUseCase } from '@/domain/UseCase/loan/get-overdue-loans.usecase'

/**
 * Crear y configurar el contenedor IoC de Awilix para Frontend
 * Centraliza la inyección de todas las dependencias de la aplicación
 */
export const container: AwilixContainer = createContainer({
  injectionMode: InjectionMode.PROXY,
  strict: true,
})

// ============================================
// REGISTRAR VALORES PRIMITIVOS (Providers)
// ============================================
container.register({
  axPublic: asValue(axPublic),
  axPrivate: asValue(axPrivate),
  tokenManager: asValue(TokenManager),
})

// ============================================
// REGISTRAR REPOSITORIOS (Data Layer)
// ============================================
container.register({
  authRepository: asClass(AuthRepository).singleton(),
  bookRepository: asClass(BookRepository).singleton(),
  cartRepository: asClass(CartRepository).singleton(),
  loanRepository: asClass(LoanRepository).singleton(),
})

// ============================================
// REGISTRAR USE CASES (Domain Layer)
// ============================================

// --- Auth Use Cases ---
container.register({
  loginUseCase: asClass(LoginUseCase).singleton(),
  registerUseCase: asClass(RegisterUseCase).singleton(),
  logoutUseCase: asClass(LogoutUseCase).singleton(),
  getProfileUseCase: asClass(GetProfileUseCase).singleton(),
})

// --- Book Use Cases ---
container.register({
  getBooksUseCase: asClass(GetBooksUseCase).singleton(),
  getBookUseCase: asClass(GetBookUseCase).singleton(),
  getAvailableBooksUseCase: asClass(GetAvailableBooksUseCase).singleton(),
  createBookUseCase: asClass(CreateBookUseCase).singleton(),
  updateBookUseCase: asClass(UpdateBookUseCase).singleton(),
  deleteBookUseCase: asClass(DeleteBookUseCase).singleton(),
})

// --- Cart Use Cases ---
container.register({
  getCartUseCase: asClass(GetCartUseCase).singleton(),
  addToCartUseCase: asClass(AddToCartUseCase).singleton(),
  removeFromCartUseCase: asClass(RemoveFromCartUseCase).singleton(),
  checkoutUseCase: asClass(CheckoutUseCase).singleton(),
})

// --- Loan Use Cases ---
container.register({
  getLoansUseCase: asClass(GetLoansUseCase).singleton(),
  createLoanUseCase: asClass(CreateLoanUseCase).singleton(),
  returnLoanUseCase: asClass(ReturnLoanUseCase).singleton(),
  getOverdueLoansUseCase: asClass(GetOverdueLoansUseCase).singleton(),
})

export default container
