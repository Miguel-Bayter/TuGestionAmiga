import type { PurchaseEntity } from '@/modules/purchase/domain/entity/purchase.entity';
import type { IPurchaseRepository } from '@/modules/purchase/domain/interface/purchase.repository';

export class GetPurchasesByUserUseCase {
  constructor(private purchaseRepository: IPurchaseRepository) {}

  async execute(userId: number): Promise<PurchaseEntity[]> {
    return this.purchaseRepository.getByUserId(userId);
  }
}
