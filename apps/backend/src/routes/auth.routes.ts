import { Router } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../middleware/error';

const router = Router();

router.post('/register', asyncHandler(async (req, res) => {
  const { email, name, password } = req.body;
  const user = await authService.register(email, name, password);
  res.status(201).json({ ok: true, data: user });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.login(email, password);
  res.json({ ok: true, data: user });
}));

export default router;
