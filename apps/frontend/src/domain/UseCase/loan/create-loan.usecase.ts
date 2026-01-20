/**
 * Create Loan Use Case
 * Creates a new loan for a book
 */

import type { ILoanRepository } from '../../Repository'
import type { Loan } from '../../Entity'

export class CreateLoanUseCase {
  constructor(private loanRepository: ILoanRepository) {}

  async execute(bookId: number): Promise<Loan> {
    return this.loanRepository.createLoan(bookId)
  }
}
