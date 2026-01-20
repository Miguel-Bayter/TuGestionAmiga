/**
 * Get Loans Use Case
 * Fetches user's loans with optional pagination
 */

import type { ILoanRepository } from '../../Repository'
import type { Loan } from '../../Entity'
import type { PaginatedResponse } from '@/shared/types'

export class GetLoansUseCase {
  constructor(private loanRepository: ILoanRepository) {}

  async execute(page?: number, pageSize?: number): Promise<Loan[] | PaginatedResponse<Loan>> {
    return this.loanRepository.getLoans(page, pageSize)
  }
}
