/**
 * Checkout Use Case
 * Processes checkout for cart items
 */

import { ICartRepository } from '@/modules/cart/domain'

export class CheckoutUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(items: Array<{ id: number; quantity: number }>): Promise<void> {
    return this.cartRepository.checkout(items)
  }
}
