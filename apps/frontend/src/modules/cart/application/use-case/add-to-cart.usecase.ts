/**
 * Add To Cart Use Case
 * Adds an item to the shopping cart
 */

import type { ICartRepository } from '@/domain/Repository/cart.repository'
import type { CartItem } from '@/domain/Entity/cart.entity'

export class AddToCartUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(bookId: number, quantity: number): Promise<CartItem> {
    return this.cartRepository.addItem(bookId, quantity)
  }
}
