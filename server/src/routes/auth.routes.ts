import { Router } from 'express';
import { register, login, logout, refreshToken } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

// Example protected route for testing
router.get('/me', authenticateToken, (req, res) => {
  res.json({ message: 'Protected data accessed successfully', userId: (req as any).userId });
});

export default router;
