/**
 * Loan Schemas
 * Zod validation schemas for loan endpoints
 */

import { z } from 'zod'
import { bookSchema } from '@/modules/books/infrastructure/schema/book.schema'

/**
 * Loan validation schema
 */
export const loanSchema = z.object({
  id: z.number(),
  userId: z.number(),
  bookId: z.number(),
  loanDate: z.string(),
  returnDate: z.string(),
  dueDate: z.boolean(),
  book: bookSchema.optional(),
})

export type LoanType = z.infer<typeof loanSchema>

/**
 * Loans array validation schema
 */
export const loansArraySchema = z.array(loanSchema)

export type LoansArrayType = z.infer<typeof loansArraySchema>

/**
 * Create loan request validation schema
 */
export const createLoanSchema = z.object({
  bookId: z.number().min(1, 'Book ID is required'),
})

export type CreateLoanType = z.infer<typeof createLoanSchema>

/**
 * Return loan request validation schema
 */
export const returnLoanSchema = z.object({
  bookId: z.number().min(1, 'Book ID is required'),
})

export type ReturnLoanType = z.infer<typeof returnLoanSchema>
