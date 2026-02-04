import type { ICartRepository } from '@/modules/cart/domain/interface/cart.repository';
import type { CartItemEntity } from '@/modules/cart/domain/entity/cart-item.entity';

export class UpdateCartItemQuantityUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(cartItemId: number, quantity: number): Promise<CartItemEntity> {
    return this.cartRepository.updateCartItemQuantity(cartItemId, quantity);
  }
}
