import { Router } from 'express';
import authRoutes from './auth.routes';
import booksRoutes from './books.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Server is running' });
});

// Routes
router.use('/auth', authRoutes);
router.use('/books', booksRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({ ok: false, error: 'Endpoint not found' });
});

export default router;
