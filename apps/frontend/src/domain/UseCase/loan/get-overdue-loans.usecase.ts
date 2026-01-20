/**
 * Get Overdue Loans Use Case
 * Fetches user's overdue loans
 */

import type { ILoanRepository } from '@/domain/Repository/loan.repository'
import type { Loan } from '@/domain/Entity/loan.entity'

export class GetOverdueLoansUseCase {
  constructor(private loanRepository: ILoanRepository) {}

  async execute(): Promise<Loan[]> {
    return this.loanRepository.getOverdueLoans()
  }
}
