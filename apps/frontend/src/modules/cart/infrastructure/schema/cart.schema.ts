/**
 * Cart Schemas
 * Zod validation schemas for cart endpoints
 */

import { z } from 'zod'
import { bookSchema } from '@/modules/books/infrastructure/schema/book.schema'

/**
 * Cart item validation schema
 */
export const cartItemSchema = z.object({
  id_carrito: z.number(),
  id_usuario: z.number(),
  id_libro: z.number(),
  cantidad: z.number().min(1, 'Quantity must be at least 1'),
  precio_unitario: z.number(),
  libro: bookSchema.optional(),
})

export type CartItemType = z.infer<typeof cartItemSchema>

/**
 * Cart items array validation schema
 */
export const cartItemsArraySchema = z.array(cartItemSchema)

export type CartItemsArrayType = z.infer<typeof cartItemsArraySchema>

/**
 * Add to cart request validation schema
 */
export const addToCartSchema = z.object({
  id_libro: z.number().min(1, 'Book ID is required'),
  cantidad: z.number().min(1, 'Quantity must be at least 1'),
})

export type AddToCartType = z.infer<typeof addToCartSchema>

/**
 * Update cart item request validation schema
 */
export const updateCartItemSchema = z.object({
  cantidad: z.number().min(1, 'Quantity must be at least 1'),
})

export type UpdateCartItemType = z.infer<typeof updateCartItemSchema>

/**
 * Checkout request validation schema
 */
export const checkoutSchema = z.object({
  items: z.array(
    z.object({
      id_libro: z.number(),
      cantidad: z.number().min(1),
    })
  ),
})

export type CheckoutType = z.infer<typeof checkoutSchema>
