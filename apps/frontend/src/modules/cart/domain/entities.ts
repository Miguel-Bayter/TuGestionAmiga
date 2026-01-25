/**
 * Cart Domain Entities
 * CartItem type from Prisma schema
 */

export interface CartItem {
  id: number
  userId: number
  bookId: number
  quantity: number
  createdAt: Date
  updatedAt: Date
}
