/**
 * Get Loans Use Case
 * Fetches user's loans with optional pagination
 */

import type { ILoanRepository } from '@/domain/Repository/loan.repository'
import type { Loan } from '@/domain/Entity/loan.entity'
import type { PaginatedResponse } from '@/shared/domain/types'

export class GetLoansUseCase {
  constructor(private loanRepository: ILoanRepository) {}

  async execute(page?: number, pageSize?: number): Promise<Loan[] | PaginatedResponse<Loan>> {
    return this.loanRepository.getLoans(page, pageSize)
  }
}
