import type { CartItemEntity } from '@/modules/cart/domain/entity/cart-item.entity';

/**
 * Cart repository interface
 * Defines contract for cart data access
 */
export interface ICartRepository {
  /**
   * Get cart items for a specific user
   * @param userId - User ID to get cart items for
   * @returns Promise with array of cart item entities
   */
  getByUserId(userId: number): Promise<CartItemEntity[]>;
  addCartItem(userId: number, bookId: number, quantity: number): Promise<CartItemEntity>;
  updateCartItemQuantity(cartItemId: number, quantity: number): Promise<CartItemEntity>;
  removeCartItem(cartItemId: number): Promise<void>;
}
