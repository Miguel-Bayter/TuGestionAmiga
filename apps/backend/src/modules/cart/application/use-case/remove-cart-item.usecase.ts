import type { ICartRepository } from '@/modules/cart/domain/interface/cart.repository';

export class RemoveCartItemUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(cartItemId: number): Promise<void> {
    await this.cartRepository.removeCartItem(cartItemId);
  }
}
