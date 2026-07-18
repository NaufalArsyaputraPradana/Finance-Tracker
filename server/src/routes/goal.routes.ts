import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../controllers/goal.controller';

const router = Router();

router.use(authenticateToken);

router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;
