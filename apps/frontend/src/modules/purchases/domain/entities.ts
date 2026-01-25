/**
 * Purchases Domain Entities
 * Purchase type from Prisma schema
 */

export interface Purchase {
  id: number
  userId: number
  bookId: number
  price: number
  date: Date
  createdAt: Date
  updatedAt: Date
}
