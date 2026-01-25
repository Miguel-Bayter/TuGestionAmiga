/**
 * Loans Domain Entities
 * Loan type from Prisma schema
 */

export interface Loan {
  id: number
  userId: number
  bookId: number
  loanDate: Date
  dueDate: Date
  returnedDate?: Date
  status: string
  extensions: number
  createdAt: Date
  updatedAt: Date
}
