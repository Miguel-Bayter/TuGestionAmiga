import type { ICartRepository } from '@/modules/cart/domain/interface/cart.repository';
import type { CartItemEntity } from '@/modules/cart/domain/entity/cart-item.entity';

export class AddCartItemUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(userId: number, bookId: number, quantity: number): Promise<CartItemEntity> {
    return this.cartRepository.addCartItem(userId, bookId, quantity);
  }
}
