/**
 * Remove From Cart Use Case
 * Removes an item from the shopping cart
 */

import type { ICartRepository } from '@/domain/Repository/cart.repository'

export class RemoveFromCartUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(cartItemId: number): Promise<void> {
    return this.cartRepository.removeItem(cartItemId)
  }
}
