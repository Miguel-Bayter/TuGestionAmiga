/**
 * Loan Repository Interface
 * Contract for loan operations
 */

import type { Loan } from '../Entity'
import type { PaginatedResponse } from '@/shared/domain/types'

export interface ILoanRepository {
  /**
   * Get user's loans
   */
  getLoans(page?: number, pageSize?: number): Promise<Loan[] | PaginatedResponse<Loan>>

  /**
   * Get a single loan by ID
   */
  getLoan(id: number): Promise<Loan>

  /**
   * Create a new loan
   */
  createLoan(bookId: number): Promise<Loan>

  /**
   * Return a loaned book
   */
  returnLoan(id: number): Promise<void>

  /**
   * Get active loans (not returned)
   */
  getActiveLoans(): Promise<Loan[]>

  /**
   * Get overdue loans
   */
  getOverdueLoans(): Promise<Loan[]>
}
