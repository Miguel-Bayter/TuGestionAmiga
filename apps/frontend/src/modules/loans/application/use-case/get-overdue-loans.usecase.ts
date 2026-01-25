/**
 * Get Overdue Loans Use Case
 * Fetches user's overdue loans
 */

import { type ILoanRepository, type Loan } from '@/modules/loans/domain'

export class GetOverdueLoansUseCase {
  constructor(private loanRepository: ILoanRepository) {}

  async execute(): Promise<Loan[]> {
    return this.loanRepository.getOverdueLoans()
  }
}
