/**
 * Create Loan Use Case
 * Creates a new loan for a book
 */

import { type ILoanRepository, type Loan } from '@/modules/loans/domain'

export class CreateLoanUseCase {
  constructor(private loanRepository: ILoanRepository) {}

  async execute(bookId: number): Promise<Loan> {
    return this.loanRepository.createLoan(bookId)
  }
}
