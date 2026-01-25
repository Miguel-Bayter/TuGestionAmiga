/**
 * Loans Response Types
 * Output types for loan endpoints
 */

import type { Loan } from './entities'

export interface GetLoansResponse {
  data: Loan[]
  meta?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface CreateLoanResponse {
  data: Loan
}

export interface ReturnLoanResponse {
  data: Loan
}

export interface ExtendLoanResponse {
  data: Loan
}

export interface GetOverdueLoansResponse {
  data: Loan[]
  total: number
}
