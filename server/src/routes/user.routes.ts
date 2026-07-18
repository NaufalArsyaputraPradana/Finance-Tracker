import { Router } from 'express';
import { updateProfile } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.put('/profile', updateProfile);

export default router;
