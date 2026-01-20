/**
 * Checkout Use Case
 * Processes checkout for cart items
 */

import { ICartRepository } from '@/domain/Repository/cart.repository'

export class CheckoutUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(items: Array<{ id_libro: number; cantidad: number }>): Promise<void> {
    return this.cartRepository.checkout(items)
  }
}
