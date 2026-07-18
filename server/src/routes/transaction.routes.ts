import { Router } from 'express';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, createBulkTransactions } from '../controllers/transaction.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All transaction routes require authentication
router.use(authenticateToken);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.post('/bulk', createBulkTransactions);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
