/**
 * Get Cart Use Case
 * Fetches the current user's shopping cart
 */

import type { ICartRepository } from '@/modules/cart/domain'
import type { Cart } from '@/domain/Entity/cart.entity'

export class GetCartUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(): Promise<Cart> {
    return this.cartRepository.getCart()
  }
}
