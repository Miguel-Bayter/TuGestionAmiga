/**
 * Loan Schemas
 * Zod validation schemas for loan endpoints
 */

import { z } from 'zod'
import { bookSchema } from './book.schema'

/**
 * Loan validation schema
 */
export const loanSchema = z.object({
  id_prestamo: z.number(),
  id_usuario: z.number(),
  id_libro: z.number(),
  fecha_prestamo: z.string(),
  fecha_vencimiento: z.string(),
  devuelto: z.boolean(),
  libro: bookSchema.optional(),
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
  id_libro: z.number().min(1, 'Book ID is required'),
})

export type CreateLoanType = z.infer<typeof createLoanSchema>

/**
 * Return loan request validation schema
 */
export const returnLoanSchema = z.object({
  id_libro: z.number().min(1, 'Book ID is required'),
})

export type ReturnLoanType = z.infer<typeof returnLoanSchema>
