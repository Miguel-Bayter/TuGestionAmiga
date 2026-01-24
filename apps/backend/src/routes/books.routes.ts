import { Router } from 'express';
import type { AwilixContainer } from 'awilix';
import { asyncHandler } from '../shared/middleware/error';

export function createBooksRoutes(container: AwilixContainer) {
  const router = Router();
  const { bookService } = container.cradle;

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const available = req.query.available === 'true';
      const books = await bookService.getAll(available);
      res.json({ ok: true, data: books });
    })
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const book = await bookService.getById(Number(req.params.id));
      res.json({ ok: true, data: book });
    })
  );

  return router;
}

export default createBooksRoutes;
