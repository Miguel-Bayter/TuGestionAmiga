import type { ILoanRepository } from '@/modules/loan/domain/interface/loan.repository';
import type { LoanEntity } from '@/modules/loan/domain/entity/loan.entity';

export class GetAllLoansUseCase {
  constructor(private loanRepository: ILoanRepository) {}

  async execute(searchQuery?: string): Promise<LoanEntity[]> {
    return this.loanRepository.getAll(searchQuery);
  }
}
