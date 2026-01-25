/**
 * Books Domain Entities
 * Book and Category types from Prisma schema
 */

export interface Category {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Book {
  id: number
  title: string
  author: string
  description?: string
  categoryId?: number
  price: number
  purchaseStock: number
  rentalStock: number
  available: boolean
  createdAt: Date
  updatedAt: Date
  category?: Category
}
