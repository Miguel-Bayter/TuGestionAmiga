import { type AwilixContainer, createContainer, InjectionMode, asClass } from 'awilix'
import type { Cradle } from './container.types'

// ============================================
// REPOSITORIES (Infrastructure Layer)
// ============================================
import { AuthRepository } from '@/modules/auth/infrastructure/repository/auth.repository-impl'
import { BookRepository } from '@/modules/books/infrastructure/repository/book.repository-impl'
import { CartRepository } from '@/modules/cart/infrastructure/repository/cart.repository-impl'
import { LoanRepository } from '@/modules/loans/infrastructure/repository/loan.repository-impl'

// ============================================
// USE CASES - AUTH MODULE (6 total)
// ============================================
import { LoginUseCase } from '@/modules/auth/application/use-case/login.usecase'
import { RegisterUseCase } from '@/modules/auth/application/use-case/register.usecase'
import { GetProfileUseCase } from '@/modules/auth/application/use-case/get-profile.usecase'
import { LogoutUseCase } from '@/modules/auth/application/use-case/logout.usecase'
import { ForgotPasswordUseCase } from '@/modules/auth/application/use-case/forgot-password.usecase'
import { VerifyPasswordCodeUseCase } from '@/modules/auth/application/use-case/verify-password-code.usecase'

// ============================================
// USE CASES - BOOKS MODULE (6 total)
// ============================================
import { GetBooksUseCase } from '@/modules/books/application/use-case/get-books.usecase'
import { GetAvailableBooksUseCase } from '@/modules/books/application/use-case/get-available-books.usecase'
import { GetBookUseCase } from '@/modules/books/application/use-case/get-book.usecase'
import { CreateBookUseCase } from '@/modules/books/application/use-case/create-book.usecase'
import { UpdateBookUseCase } from '@/modules/books/application/use-case/update-book.usecase'
import { DeleteBookUseCase } from '@/modules/books/application/use-case/delete-book.usecase'

// ============================================
// USE CASES - CART MODULE (4 total)
// ============================================
import { AddToCartUseCase } from '@/modules/cart/application/use-case/add-to-cart.usecase'
import { GetCartUseCase } from '@/modules/cart/application/use-case/get-cart.usecase'
import { RemoveFromCartUseCase } from '@/modules/cart/application/use-case/remove-from-cart.usecase'
import { CheckoutUseCase } from '@/modules/cart/application/use-case/checkout.usecase'

// ============================================
// USE CASES - LOANS MODULE (4 total)
// ============================================
import { GetLoansUseCase } from '@/modules/loans/application/use-case/get-loans.usecase'
import { CreateLoanUseCase } from '@/modules/loans/application/use-case/create-loan.usecase'
import { ReturnLoanUseCase } from '@/modules/loans/application/use-case/return-loan.usecase'
import { GetOverdueLoansUseCase } from '@/modules/loans/application/use-case/get-overdue-loans.usecase'

// ============================================
// USE CASES - USER MODULE (2 total)
// ============================================
import { GetProfileUseCase as GetUserProfileUseCase } from '@/modules/user/application/use-case/get-user-profile.usecase'
import { UpdateProfileUseCase } from '@/modules/user/application/use-case/update-profile.usecase'

// ============================================
// STATE SERVICES (Application Layer)
// ============================================
import { AuthStateService } from '@/shared/infrastructure/services/auth-state.service'
import { BookStateService } from '@/shared/infrastructure/services/book-state.service'
import { CartStateService } from '@/shared/infrastructure/services/cart-state.service'
import { LoanStateService } from '@/shared/infrastructure/services/loan-state.service'
import { UIStateService } from '@/shared/infrastructure/services/ui-state.service'
import { ToastStateService } from '@/shared/infrastructure/services/toast-state.service'

/**
 * Create and configure the IoC container of Awilix
 * Centralize the injection of all application dependencies
 *
 * Total registrations:
 * - Repositories: 4
 * - Use Cases: 22
 * - State Services: 6
 */
export const container: AwilixContainer<Cradle> = createContainer({
  injectionMode: InjectionMode.CLASSIC,
  strict: true,
})

// ============================================
// REGISTER REPOSITORIES (Data Layer)
// ============================================
container.register({
  authRepository: asClass(AuthRepository).singleton(),
  bookRepository: asClass(BookRepository).singleton(),
  cartRepository: asClass(CartRepository).singleton(),
  loanRepository: asClass(LoanRepository).singleton(),
})

// ============================================
// REGISTER USE CASES (Domain Layer)
// ============================================
container.register({
  // Auth Module (6)
  loginUseCase: asClass(LoginUseCase).singleton(),
  registerUseCase: asClass(RegisterUseCase).singleton(),
  getProfileUseCase: asClass(GetProfileUseCase).singleton(),
  logoutUseCase: asClass(LogoutUseCase).singleton(),
  forgotPasswordUseCase: asClass(ForgotPasswordUseCase).singleton(),
  verifyPasswordCodeUseCase: asClass(VerifyPasswordCodeUseCase).singleton(),

  // Books Module (6)
  getBooksUseCase: asClass(GetBooksUseCase).singleton(),
  getAvailableBooksUseCase: asClass(GetAvailableBooksUseCase).singleton(),
  getBookUseCase: asClass(GetBookUseCase).singleton(),
  createBookUseCase: asClass(CreateBookUseCase).singleton(),
  updateBookUseCase: asClass(UpdateBookUseCase).singleton(),
  deleteBookUseCase: asClass(DeleteBookUseCase).singleton(),

  // Cart Module (4)
  addToCartUseCase: asClass(AddToCartUseCase).singleton(),
  getCartUseCase: asClass(GetCartUseCase).singleton(),
  removeFromCartUseCase: asClass(RemoveFromCartUseCase).singleton(),
  checkoutUseCase: asClass(CheckoutUseCase).singleton(),

  // Loans Module (4)
  getLoansUseCase: asClass(GetLoansUseCase).singleton(),
  createLoanUseCase: asClass(CreateLoanUseCase).singleton(),
  returnLoanUseCase: asClass(ReturnLoanUseCase).singleton(),
  getOverdueLoansUseCase: asClass(GetOverdueLoansUseCase).singleton(),

  // User Module (2)
  getUserProfileUseCase: asClass(GetUserProfileUseCase).singleton(),
  updateProfileUseCase: asClass(UpdateProfileUseCase).singleton(),
})

// ============================================
// REGISTER STATE SERVICES (Application Layer)
// ============================================
container.register({
  authStateService: asClass(AuthStateService).singleton(),
  bookStateService: asClass(BookStateService).singleton(),
  cartStateService: asClass(CartStateService).singleton(),
  loanStateService: asClass(LoanStateService).singleton(),
  uiStateService: asClass(UIStateService).singleton(),
  toastStateService: asClass(ToastStateService).singleton(),
})

export default container
