/**
 * Book Schemas
 * Zod validation schemas for book endpoints
 */

import { z } from 'zod'

/**
 * Book validation schema
 */
export const bookSchema = z.object({
  id_libro: z.number(),
  titulo: z.string(),
  autor: z.string(),
  descripcion: z.string().optional(),
  valor: z.number().optional(),
  disponibilidad: z.number().optional(),
  stock: z.number().optional(),
  stock_compra: z.number().optional(),
  stock_renta: z.number().optional(),
  nombre_categoria: z.string().optional(),
  portada_url: z.string().optional(),
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
  titulo: z.string().min(1, 'Title is required'),
  autor: z.string().min(1, 'Author is required'),
  descripcion: z.string().optional(),
  valor: z.number().optional(),
  stock_compra: z.number().optional(),
  stock_renta: z.number().optional(),
})

export type CreateBookType = z.infer<typeof createBookSchema>

/**
 * Update book request validation schema
 */
export const updateBookSchema = createBookSchema.partial()

export type UpdateBookType = z.infer<typeof updateBookSchema>
