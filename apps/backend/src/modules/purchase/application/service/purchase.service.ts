import type { GetPurchasesByUserUseCase } from '@/modules/purchase/application/use-case/get-purchases-by-user.usecase'
import type { PurchaseEntity } from '@/modules/purchase/domain/entity/purchase.entity'

export class PurchaseService {
  constructor(private getPurchasesByUserUseCase: GetPurchasesByUserUseCase) {}

  async getByUserId(userId: number): Promise<PurchaseEntity[]> {
    return this.getPurchasesByUserUseCase.execute(userId)
  }
}
