/**
 * Cart Repository Implementation
 * Concrete implementation of shopping cart operations
 */

import { axPrivate } from '@/shared/infrastructure/provider'
import { API_ENDPOINTS } from '@/shared/application/config'
import { cartItemSchema, cartItemsArraySchema } from '@/modules/cart/infrastructure/schema'
import type { ICartRepository } from '@/modules/cart/domain/contract'
import type { Cart, CartItem } from '@/modules/cart/domain'

export class CartRepository implements ICartRepository {
  /**
   * Get user's shopping cart
   */
  async getCart(): Promise<Cart> {
    const response = await axPrivate.get(API_ENDPOINTS.CART)

    return response.data as Cart
  }

  /**
   * Get cart items
   */
  async getCartItems(): Promise<CartItem[]> {
    const response = await axPrivate.get(API_ENDPOINTS.CART)
    const cartData = response.data as Cart

    return cartItemsArraySchema.parse(cartData.items || [])
  }

  /**
   * Add item to cart
   */
  async addItem(bookId: number, quantity: number): Promise<CartItem> {
    const response = await axPrivate.post(API_ENDPOINTS.CART, {
      bookId,
      quantity,
    })
    return cartItemSchema.parse(response.data)
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartItemId: number): Promise<void> {
    await axPrivate.delete(API_ENDPOINTS.CART_ITEM(cartItemId))
  }

  /**
   * Update cart item quantity
   */
  async updateItem(cartItemId: number, quantity: number): Promise<CartItem> {
    const response = await axPrivate.patch(API_ENDPOINTS.CART_ITEM(cartItemId), {
      quantity,
    })
    return cartItemSchema.parse(response.data)
  }

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    // Get all items and delete them
    const items = await this.getCartItems()
    await Promise.all(items.map((item) => this.removeItem(item.id)))
  }

  /**
   * Checkout cart items
   */
  async checkout(items: Array<{ bookId: number; quantity: number }>): Promise<void> {
    await axPrivate.post(API_ENDPOINTS.CART_CHECKOUT, { items })
  }
}

/**
 * Singleton instance
 */
export const cartRepository = new CartRepository()
