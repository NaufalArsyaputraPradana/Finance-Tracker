import { Router } from 'express';
import { getWallets, createWallet, updateWallet, deleteWallet } from '../controllers/wallet.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', getWallets);
router.post('/', createWallet);
router.put('/:id', updateWallet);
router.delete('/:id', deleteWallet);

export default router;
