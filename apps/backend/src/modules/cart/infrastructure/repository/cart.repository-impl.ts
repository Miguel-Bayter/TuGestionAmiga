import type { CartItemEntity } from '@/modules/cart/domain/entity/cart-item.entity';
import type { ICartRepository } from '@/modules/cart/domain/interface/cart.repository';
import type { PrismaClient } from '@prisma/client';

export class CartRepository implements ICartRepository {
  constructor(private prisma: PrismaClient) {}

  async getByUserId(userId: number): Promise<CartItemEntity[]> {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            price: true,
            purchaseStock: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return cartItems.map((item) => ({
      id: item.id,
      userId: item.userId,
      bookId: item.bookId,
      quantity: item.quantity,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      book: item.book
        ? {
            id: item.book.id,
            title: item.book.title,
            author: item.book.author,
            price: item.book.price.toNumber(),
            purchaseStock: item.book.purchaseStock,
          }
        : undefined,
    }));
  }
}
