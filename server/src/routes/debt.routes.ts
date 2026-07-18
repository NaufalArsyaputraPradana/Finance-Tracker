import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getDebts, createDebt, updateDebt, deleteDebt } from '../controllers/debt.controller';

const router = Router();

router.use(authenticateToken);

router.get('/', getDebts);
router.post('/', createDebt);
router.put('/:id', updateDebt);
router.delete('/:id', deleteDebt);

export default router;
