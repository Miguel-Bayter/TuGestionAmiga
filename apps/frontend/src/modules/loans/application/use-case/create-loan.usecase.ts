/**
 * Create Loan Use Case
 * Creates a new loan for a book
 */

import type { ILoanRepository } from '@/domain/Repository/loan.repository'
import type { Loan } from '@/domain/Entity/loan.entity'

export class CreateLoanUseCase {
  constructor(private loanRepository: ILoanRepository) {}

  async execute(bookId: number): Promise<Loan> {
    return this.loanRepository.createLoan(bookId)
  }
}
