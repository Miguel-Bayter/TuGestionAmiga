/**
 * Loan State Service
 * Manages user loans state without external dependencies
 */

import {
  GetLoansUseCase,
  CreateLoanUseCase,
  ReturnLoanUseCase,
  GetOverdueLoansUseCase,
} from '@/domain/UseCase/loan'
import type { Loan } from '@/domain/Entity/loan.entity'
import type { PaginatedResponse } from '@/shared/domain/types'

interface PaginationInfo {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface LoanStateData {
  loans: Loan[]
  overdueLoans: Loan[]
  isLoading: boolean
  error: string | null
  pagination?: PaginationInfo
}

export class LoanStateService {
  private state: LoanStateData = {
    loans: [],
    overdueLoans: [],
    isLoading: false,
    error: null,
    pagination: undefined,
  }

  private subscribers: Set<(state: LoanStateData) => void> = new Set()

  constructor(
    private getLoansUseCase: GetLoansUseCase,
    private createLoanUseCase: CreateLoanUseCase,
    private returnLoanUseCase: ReturnLoanUseCase,
    private getOverdueLoansUseCase: GetOverdueLoansUseCase
  ) {}

  async getLoans(page?: number, pageSize?: number): Promise<void> {
    this.state.isLoading = true
    this.state.error = null
    this.notifySubscribers()

    try {
      const result = await this.getLoansUseCase.execute(page, pageSize)

      if (Array.isArray(result)) {
        this.state.loans = result
        this.state.isLoading = false
      } else {
        const paginatedResult = result as PaginatedResponse<Loan>
        this.state.loans = paginatedResult.data
        this.state.isLoading = false
        this.state.pagination = paginatedResult.meta
      }

      this.notifySubscribers()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch loans'
      this.state.isLoading = false
      this.state.error = errorMessage
      this.state.loans = []

      this.notifySubscribers()
    }
  }

  async createLoan(bookId: number): Promise<void> {
    this.state.isLoading = true
    this.state.error = null
    this.notifySubscribers()

    try {
      await this.createLoanUseCase.execute(bookId)
      // Refresh loans
      const result = await this.getLoansUseCase.execute()
      if (Array.isArray(result)) {
        this.state.loans = result
        this.state.isLoading = false
      }

      this.notifySubscribers()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create loan'
      this.state.isLoading = false
      this.state.error = errorMessage

      this.notifySubscribers()
    }
  }

  async returnLoan(id: number): Promise<void> {
    this.state.isLoading = true
    this.state.error = null
    this.notifySubscribers()

    try {
      await this.returnLoanUseCase.execute(id)
      // Refresh loans
      const result = await this.getLoansUseCase.execute()
      if (Array.isArray(result)) {
        this.state.loans = result
        this.state.isLoading = false
      }

      this.notifySubscribers()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to return loan'
      this.state.isLoading = false
      this.state.error = errorMessage

      this.notifySubscribers()
    }
  }

  async getOverdueLoans(): Promise<void> {
    this.state.isLoading = true
    this.state.error = null
    this.notifySubscribers()

    try {
      const overdueLoans = await this.getOverdueLoansUseCase.execute()
      this.state.overdueLoans = overdueLoans
      this.state.isLoading = false

      this.notifySubscribers()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch overdue loans'
      this.state.isLoading = false
      this.state.error = errorMessage

      this.notifySubscribers()
    }
  }

  clearError(): void {
    this.state.error = null
    this.notifySubscribers()
  }

  getState(): LoanStateData {
    return { ...this.state }
  }

  subscribe(listener: (state: LoanStateData) => void): () => void {
    this.subscribers.add(listener)
    listener(this.state)
    return () => {
      this.subscribers.delete(listener)
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((listener) => {
      listener({ ...this.state })
    })
  }
}
