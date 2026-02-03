import type { GetAllLoansUseCase } from '@/modules/loan/application/use-case/get-all-loans.usecase';
import type { LoanEntity } from '@/modules/loan/domain/entity/loan.entity';

export class LoanService {
  constructor(private getAllLoansUseCase: GetAllLoansUseCase) {}

  async getAll(searchQuery?: string): Promise<LoanEntity[]> {
    return this.getAllLoansUseCase.execute(searchQuery);
  }
}
