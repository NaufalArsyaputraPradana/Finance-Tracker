import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { chatWithAI } from '../controllers/ai.controller';

const router = Router();

router.use(authenticateToken);

router.post('/chat', chatWithAI);

export default router;
