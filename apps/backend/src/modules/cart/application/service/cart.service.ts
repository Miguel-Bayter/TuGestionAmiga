import type { GetCartByUserUseCase } from '@/modules/cart/application/use-case/get-cart-by-user.usecase';
import type { CartItemEntity } from '@/modules/cart/domain/entity/cart-item.entity';

export class CartService {
  constructor(private getCartByUserUseCase: GetCartByUserUseCase) {}

  async getByUserId(userId: number): Promise<CartItemEntity[]> {
    return this.getCartByUserUseCase.execute(userId);
  }
}
