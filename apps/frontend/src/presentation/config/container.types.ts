/**
 * Type definitions for the Awilix IoC Container
 * Defines all dependencies registered in the container
 */

// Repositories
import type { AuthRepository } from '@/modules/auth/infrastructure/repository/auth.repository-impl'
import type { BookRepository } from '@/modules/books/infrastructure/repository/book.repository-impl'
import type { CartRepository } from '@/modules/cart/infrastructure/repository/cart.repository-impl'
import type { LoanRepository } from '@/modules/loans/infrastructure/repository/loan.repository-impl'

// Use Cases - Auth Module
import type { LoginUseCase } from '@/modules/auth/application/use-case/login.usecase'
import type { RegisterUseCase } from '@/modules/auth/application/use-case/register.usecase'
import type { GetProfileUseCase } from '@/modules/auth/application/use-case/get-profile.usecase'
import type { LogoutUseCase } from '@/modules/auth/application/use-case/logout.usecase'
import type { ForgotPasswordUseCase } from '@/modules/auth/application/use-case/forgot-password.usecase'
import type { VerifyPasswordCodeUseCase } from '@/modules/auth/application/use-case/verify-password-code.usecase'

// Use Cases - Books Module
import type { GetBooksUseCase } from '@/modules/books/application/use-case/get-books.usecase'
import type { GetAvailableBooksUseCase } from '@/modules/books/application/use-case/get-available-books.usecase'
import type { GetBookUseCase } from '@/modules/books/application/use-case/get-book.usecase'
import type { CreateBookUseCase } from '@/modules/books/application/use-case/create-book.usecase'
import type { UpdateBookUseCase } from '@/modules/books/application/use-case/update-book.usecase'
import type { DeleteBookUseCase } from '@/modules/books/application/use-case/delete-book.usecase'

// Use Cases - Cart Module
import type { AddToCartUseCase } from '@/modules/cart/application/use-case/add-to-cart.usecase'
import type { GetCartUseCase } from '@/modules/cart/application/use-case/get-cart.usecase'
import type { RemoveFromCartUseCase } from '@/modules/cart/application/use-case/remove-from-cart.usecase'
import type { CheckoutUseCase } from '@/modules/cart/application/use-case/checkout.usecase'

// Use Cases - Loans Module
import type { GetLoansUseCase } from '@/modules/loans/application/use-case/get-loans.usecase'
import type { CreateLoanUseCase } from '@/modules/loans/application/use-case/create-loan.usecase'
import type { ReturnLoanUseCase } from '@/modules/loans/application/use-case/return-loan.usecase'
import type { GetOverdueLoansUseCase } from '@/modules/loans/application/use-case/get-overdue-loans.usecase'

// Use Cases - User Module
import type { GetProfileUseCase as GetUserProfileUseCase } from '@/modules/user/application/use-case/get-user-profile.usecase'
import type { UpdateProfileUseCase } from '@/modules/user/application/use-case/update-profile.usecase'

// State Services
import type { AuthStateService } from '@/shared/infrastructure/services/auth-state.service'
import type { BookStateService } from '@/shared/infrastructure/services/book-state.service'
import type { CartStateService } from '@/shared/infrastructure/services/cart-state.service'
import type { LoanStateService } from '@/shared/infrastructure/services/loan-state.service'
import type { UIStateService } from '@/shared/infrastructure/services/ui-state.service'
import type { ToastStateService } from '@/shared/infrastructure/services/toast-state.service'

/**
 * Cradle type that defines all dependencies available in the container
 * This provides type safety when resolving dependencies
 */
export interface Cradle {
  // Repositories
  authRepository: AuthRepository
  bookRepository: BookRepository
  cartRepository: CartRepository
  loanRepository: LoanRepository

  // Use Cases - Auth Module
  loginUseCase: LoginUseCase
  registerUseCase: RegisterUseCase
  getProfileUseCase: GetProfileUseCase
  logoutUseCase: LogoutUseCase
  forgotPasswordUseCase: ForgotPasswordUseCase
  verifyPasswordCodeUseCase: VerifyPasswordCodeUseCase

  // Use Cases - Books Module
  getBooksUseCase: GetBooksUseCase
  getAvailableBooksUseCase: GetAvailableBooksUseCase
  getBookUseCase: GetBookUseCase
  createBookUseCase: CreateBookUseCase
  updateBookUseCase: UpdateBookUseCase
  deleteBookUseCase: DeleteBookUseCase

  // Use Cases - Cart Module
  addToCartUseCase: AddToCartUseCase
  getCartUseCase: GetCartUseCase
  removeFromCartUseCase: RemoveFromCartUseCase
  checkoutUseCase: CheckoutUseCase

  // Use Cases - Loans Module
  getLoansUseCase: GetLoansUseCase
  createLoanUseCase: CreateLoanUseCase
  returnLoanUseCase: ReturnLoanUseCase
  getOverdueLoansUseCase: GetOverdueLoansUseCase

  // Use Cases - User Module
  getUserProfileUseCase: GetUserProfileUseCase
  updateProfileUseCase: UpdateProfileUseCase

  // State Services
  authStateService: AuthStateService
  bookStateService: BookStateService
  cartStateService: CartStateService
  loanStateService: LoanStateService
  uiStateService: UIStateService
  toastStateService: ToastStateService
}
