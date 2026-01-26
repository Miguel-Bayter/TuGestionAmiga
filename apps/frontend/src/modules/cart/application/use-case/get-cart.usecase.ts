/**
 * Get Cart Use Case
 * Fetches the current user's shopping cart
 */

import type { ICartRepository } from '@/modules/cart/domain'
import type { Cart } from '@/modules/cart/domain/entities'

export class GetCartUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(): Promise<Cart> {
    return this.cartRepository.getCart()
  }
}
