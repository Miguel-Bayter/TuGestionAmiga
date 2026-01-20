/**
 * Cart Repository Implementation
 * Concrete implementation of shopping cart operations
 */

import { AxPrivate } from '../Provider'
import { API_ENDPOINTS } from '@/shared/config'
import { cartItemSchema, cartItemsArraySchema } from '../Schema'
import type { ICartRepository } from '@/domain/Repository'
import type { Cart, CartItem } from '@/domain/entity'

export class CartRepository implements ICartRepository {
  /**
   * Get user's shopping cart
   */
  async getCart(): Promise<Cart> {
    const response = await AxPrivate.get(API_ENDPOINTS.CART)
    return response.data as Cart
  }

  /**
   * Get cart items
   */
  async getCartItems(): Promise<CartItem[]> {
    const response = await AxPrivate.get(API_ENDPOINTS.CART)
    const cartData = response.data as Cart
    return cartItemsArraySchema.parse(cartData.items || [])
  }

  /**
   * Add item to cart
   */
  async addItem(bookId: number, quantity: number): Promise<CartItem> {
    const response = await AxPrivate.post(API_ENDPOINTS.CART, {
      id_libro: bookId,
      cantidad: quantity,
    })
    return cartItemSchema.parse(response.data)
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartItemId: number): Promise<void> {
    await AxPrivate.delete(API_ENDPOINTS.CART_ITEM(cartItemId))
  }

  /**
   * Update cart item quantity
   */
  async updateItem(cartItemId: number, quantity: number): Promise<CartItem> {
    const response = await AxPrivate.patch(API_ENDPOINTS.CART_ITEM(cartItemId), {
      cantidad: quantity,
    })
    return cartItemSchema.parse(response.data)
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    // Get all items and delete them
    const items = await this.getCartItems()
    await Promise.all(items.map((item) => this.removeItem(item.id_carrito)))
  }

  /**
   * Checkout cart items
   */
  async checkout(items: Array<{ id_libro: number; cantidad: number }>): Promise<void> {
    await AxPrivate.post(API_ENDPOINTS.CART_CHECKOUT, { items })
  }
}

/**
 * Singleton instance
 */
export const cartRepository = new CartRepository()
