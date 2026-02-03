import type { ICartRepository } from '@/modules/cart/domain/interface/cart.repository';
import type { CartItemEntity } from '@/modules/cart/domain/entity/cart-item.entity';

export class GetCartByUserUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(userId: number): Promise<CartItemEntity[]> {
    return this.cartRepository.getByUserId(userId);
  }
}
