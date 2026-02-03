import type { LoanEntity } from '@/modules/loan/domain/entity/loan.entity';

/**
 * Loan repository interface
 * Defines contract for loan data access
 */
export interface ILoanRepository {
  /**
   * Get all loans with optional search filter
   * @param searchQuery - Optional search term to filter by user name or email
   * @returns Promise with array of loan entities
   */
  getAll(searchQuery?: string): Promise<LoanEntity[]>;
}
