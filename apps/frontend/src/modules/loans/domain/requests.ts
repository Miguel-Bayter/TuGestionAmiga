/**
 * Loans Request Types
 * Input types for loan endpoints
 */

export interface CreateLoanRequest {
  bookId: number
}

export interface ReturnLoanRequest {
  loanId: number
}

export interface ExtendLoanRequest {
  loanId: number
}

export interface GetLoansRequest {
  userId?: number
  status?: string
  page?: number
  pageSize?: number
}
