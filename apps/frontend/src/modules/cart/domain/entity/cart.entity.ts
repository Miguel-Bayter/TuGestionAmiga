/**
 * Cart Entity
 * Domain model for shopping cart
 */

import type { Book } from '@/modules/books/domain'

export interface CartItem {
  id: number
  id_usuario: number
  id_libro: number
  cantidad: number
  precio_unitario: number
  libro?: Book
}

export interface Cart {
  id_usuario: number
  items: CartItem[]
  total: number
}
