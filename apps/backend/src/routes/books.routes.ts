import { Router } from 'express';
import { bookService } from '../services/book.service';
import { asyncHandler } from '../middleware/error';

const router = Router();

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

export default router;
