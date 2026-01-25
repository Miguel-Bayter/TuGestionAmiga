/**
 * Return Loan Use Case
 * Returns a loaned book
 */

import type { ILoanRepository } from '@/modules/loans/domain'

export class ReturnLoanUseCase {
  constructor(private loanRepository: ILoanRepository) {}

  async execute(id: number): Promise<void> {
    return this.loanRepository.returnLoan(id)
  }
}
