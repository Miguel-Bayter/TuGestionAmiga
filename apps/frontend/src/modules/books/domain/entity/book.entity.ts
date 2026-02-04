/**
 * Book Entity
 * Domain model for book
 */

export interface Book {
  id: number
  title: string
  author: string
  description?: string
  price?: number
  availability: boolean
  stock?: number
  purchaseStock?: number
  rentalStock?: number
  categoryName?: string
  coverUrl?: string
}
