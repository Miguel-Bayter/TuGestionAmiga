/**
 * Loan Repository Implementation
 * Concrete implementation of loan operations
 */

import { axPrivate } from '@/shared/infrastructure/provider'
import { API_ENDPOINTS } from '@/shared/config'
import { loanSchema, loansArraySchema } from '@/modules/loans/infrastructure/schema'
import type { ILoanRepository } from '@/modules/loans/domain/repository/loan.repository'
import type { Loan } from '@/modules/loans/domain/entity/loan.entity'
import type { PaginatedResponse } from '@/shared/types'
import { isOverdue } from '@/shared/helpers'

export class LoanRepository implements ILoanRepository {
  /**
   * Get user's loans
   */
  async getLoans(page?: number, pageSize?: number): Promise<Loan[] | PaginatedResponse<Loan>> {
    const params = new URLSearchParams()
    if (page !== undefined) params.append('page', page.toString())
    if (pageSize !== undefined) params.append('pageSize', pageSize.toString())

    const response = await axPrivate.get(API_ENDPOINTS.LOANS, {
      params: Object.fromEntries(params),
    })

    // If response has meta, it's paginated
    if (response.data.meta) {
      return response.data as PaginatedResponse<Loan>
    }

    // Otherwise, validate as array
    return loansArraySchema.parse(response.data)
  }

  /**
   * Get a single loan by ID
   */
  async getLoan(id: number): Promise<Loan> {
    const response = await axPrivate.get(API_ENDPOINTS.LOAN_BY_ID(id))
    return loanSchema.parse(response.data)
  }

  /**
   * Create a new loan
   */
  async createLoan(bookId: number): Promise<Loan> {
    const response = await axPrivate.post(API_ENDPOINTS.LOANS, {
      id_libro: bookId,
    })
    return loanSchema.parse(response.data)
  }

  /**
   * Return a loaned book
   */
  async returnLoan(id: number): Promise<void> {
    await axPrivate.post(API_ENDPOINTS.LOAN_RETURN(id), {})
  }

  /**
   * Get active loans (not returned)
   */
  async getActiveLoans(): Promise<Loan[]> {
    const response = await axPrivate.get(API_ENDPOINTS.LOANS, {
      params: { devuelto: false },
    })
    return loansArraySchema.parse(response.data)
  }

  /**
   * Get overdue loans
   */
  async getOverdueLoans(): Promise<Loan[]> {
    const loans = await this.getActiveLoans()
    return loans.filter((loan) => isOverdue(loan.fecha_vencimiento))
  }
}

/**
 * Singleton instance
 */
export const loanRepository = new LoanRepository()
