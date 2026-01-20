/**
 * Get Overdue Loans Use Case
 * Fetches user's overdue loans
 */

import type { ILoanRepository } from '../../Repository'
import type { Loan } from '../../Entity'

export class GetOverdueLoansUseCase {
  constructor(private loanRepository: ILoanRepository) {}

  async execute(): Promise<Loan[]> {
    return this.loanRepository.getOverdueLoans()
  }
}
