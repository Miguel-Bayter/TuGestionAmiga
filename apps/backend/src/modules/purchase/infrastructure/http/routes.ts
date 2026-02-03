import { Router } from 'express'
import type { AwilixContainer } from 'awilix'
import { asyncHandler } from '@/shared/middleware/error'
import { requireAuth } from '@/shared/middleware/jwt'
import type { PurchaseService } from '@/modules/purchase/application/service/purchase.service'

export function createPurchaseRoutes(container: AwilixContainer): Router {
  const router = Router()
  const purchaseService: PurchaseService = container.resolve('purchaseService')

  router.get(
    '/',
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = req.query.userId

      if (!userId) {
        res.status(400).json({ ok: false, error: 'userId is required' })
        return
      }

      const uid = Number(userId)
      if (isNaN(uid)) {
        res.status(400).json({ ok: false, error: 'Invalid userId' })
        return
      }

      // Authorization: user can only see own purchases OR admin can see any
      if (!req.user?.isAdmin && req.user?.userId !== uid) {
        res.status(403).json({ ok: false, error: 'Not authorized' })
        return
      }

      const purchases = await purchaseService.getByUserId(uid)
      res.json({ ok: true, data: purchases })
    })
  )

  return router
}
