import type { PurchaseEntity } from '@/modules/purchase/domain/entity/purchase.entity';
import type { IPurchaseRepository } from '@/modules/purchase/domain/interface/purchase.repository';
import type { PrismaClient } from '@prisma/client';

export class PurchaseRepository implements IPurchaseRepository {
  constructor(private prisma: PrismaClient) {}

  async getByUserId(userId: number): Promise<PurchaseEntity[]> {
    const purchases = await this.prisma.purchase.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { date: 'desc' },
    });

    return purchases.map((purchase) => ({
      ...purchase,
      price: purchase.price.toNumber(),
      book: purchase.book
        ? {
            id: purchase.book.id,
            title: purchase.book.title,
            author: purchase.book.author,
          }
        : undefined,
    }));
  }
}
