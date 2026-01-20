/**
 * Loan Store
 * Manages user loans state and actions using Zustand
 */

import { create } from 'zustand'
import {
  GetLoansUseCase,
  CreateLoanUseCase,
  ReturnLoanUseCase,
  GetOverdueLoansUseCase,
} from '@/domain/UseCase/loan'
import { loanRepository } from '@/data/Repository/loan.repository-impl'
import type { Loan } from '@/domain/Entity/loan.entity'
import type { PaginatedResponse } from '@/shared/types'

interface LoanState {
  // State
  loans: Loan[]
  overdueLoans: Loan[]
  isLoading: boolean
  error: string | null
  pagination?: PaginationInfo

  // Actions
  getLoans: (page?: number, pageSize?: number) => Promise<void>
  createLoan: (bookId: number) => Promise<void>
  returnLoan: (id: number) => Promise<void>
  getOverdueLoans: () => Promise<void>
  clearError: () => void
}

interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// Initialize use cases
const getLoansUseCase = new GetLoansUseCase(loanRepository)
const createLoanUseCase = new CreateLoanUseCase(loanRepository)
const returnLoanUseCase = new ReturnLoanUseCase(loanRepository)
const getOverdueLoansUseCase = new GetOverdueLoansUseCase(loanRepository)

export const useLoanStore = create<LoanState>((set) => ({
  // Initial state
  loans: [],
  overdueLoans: [],
  isLoading: false,
  error: null,
  pagination: undefined,

  // Get loans
  getLoans: async (page?: number, pageSize?: number) => {
    set({ isLoading: true, error: null })

    try {
      const result = await getLoansUseCase.execute(page, pageSize)

      if (Array.isArray(result)) {
        set({
          loans: result,
          isLoading: false,
        })
      } else {
        const paginatedResult = result as PaginatedResponse<Loan>
        set({
          loans: paginatedResult.data,
          isLoading: false,
          pagination: paginatedResult.meta,
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch loans'
      set({
        isLoading: false,
        error: errorMessage,
        loans: [],
      })
    }
  },

  // Create loan
  createLoan: async (bookId: number) => {
    set({ isLoading: true, error: null })

    try {
      await createLoanUseCase.execute(bookId)
      // Refresh loans
      const result = await getLoansUseCase.execute()
      if (Array.isArray(result)) {
        set({
          loans: result,
          isLoading: false,
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create loan'
      set({
        isLoading: false,
        error: errorMessage,
      })
    }
  },

  // Return loan
  returnLoan: async (id: number) => {
    set({ isLoading: true, error: null })

    try {
      await returnLoanUseCase.execute(id)
      // Refresh loans
      const result = await getLoansUseCase.execute()
      if (Array.isArray(result)) {
        set({
          loans: result,
          isLoading: false,
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to return loan'
      set({
        isLoading: false,
        error: errorMessage,
      })
    }
  },

  // Get overdue loans
  getOverdueLoans: async () => {
    set({ isLoading: true, error: null })

    try {
      const overdueLoans = await getOverdueLoansUseCase.execute()
      set({
        overdueLoans,
        isLoading: false,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch overdue loans'
      set({
        isLoading: false,
        error: errorMessage,
      })
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },
}))
