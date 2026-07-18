import { Router } from 'express';
import { getSummary, getTrend, exportExcel } from '../controllers/report.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/summary', getSummary);
router.get('/trend', getTrend);
router.get('/export/excel', exportExcel);

export default router;
