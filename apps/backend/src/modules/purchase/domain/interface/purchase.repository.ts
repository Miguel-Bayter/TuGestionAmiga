import type { PurchaseEntity } from '@/modules/purchase/domain/entity/purchase.entity'

export interface IPurchaseRepository {
  getByUserId(userId: number): Promise<PurchaseEntity[]>
}
