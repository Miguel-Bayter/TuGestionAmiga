/**
 * Loans Request Types
 * Input types for loan endpoints
 */

export interface CreateLoanRequest {
  bookId: number
  dueDate: Date
}

export interface ReturnLoanRequest {
  loanId: number
}

export interface GetLoansRequest {
  page?: number
  pageSize?: number
}
