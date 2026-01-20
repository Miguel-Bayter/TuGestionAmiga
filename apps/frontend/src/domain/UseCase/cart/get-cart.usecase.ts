/**
 * Get Cart Use Case
 * Fetches the current user's shopping cart
 */

import type { ICartRepository } from '../../Repository'
import type { Cart } from '../../Entity'

export class GetCartUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(): Promise<Cart> {
    return this.cartRepository.getCart()
  }
}
