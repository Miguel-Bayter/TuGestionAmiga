/**
 * Book Schemas
 * Zod validation schemas for book endpoints
 */

import { z } from 'zod'

/**
 * Book validation schema
 */
export const bookSchema = z.object({
  id: z.number(),
  title: z.string(),
  author: z.string(),
  description: z.string().optional(),
  price: z.number().optional(),
  available: z.number().optional(),
  stock: z.number().optional(),
  purchaseStock: z.number().optional(),
  rentalStock: z.number().optional(),
  categoryId: z.string().optional(),
  coverUrl: z.string().optional(),
})

export type BookType = z.infer<typeof bookSchema>

/**
 * Book array validation schema
 */
export const booksArraySchema = z.array(bookSchema)

export type BooksArrayType = z.infer<typeof booksArraySchema>

/**
 * Create book request validation schema
 */
export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  description: z.string().optional(),
  price: z.number().optional(),
  stockPurchase: z.number().optional(),
  stockRental: z.number().optional(),
})

export type CreateBookType = z.infer<typeof createBookSchema>

/**
 * Update book request validation schema
 */
export const updateBookSchema = createBookSchema.partial()

export type UpdateBookType = z.infer<typeof updateBookSchema>
