/**
 * Add To Cart Use Case
 * Adds an item to the shopping cart
 */

import type { ICartRepository } from '@/modules/cart/domain'
import type { CartItem } from '@/modules/cart/domain'

export class AddToCartUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(bookId: number, quantity: number): Promise<CartItem> {
    return this.cartRepository.addItem(bookId, quantity)
  }
}
