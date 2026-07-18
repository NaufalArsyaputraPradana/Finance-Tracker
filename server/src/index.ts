import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import transactionRoutes from './routes/transaction.routes';
import budgetRoutes from './routes/budget.routes';
import reportRoutes from './routes/report.routes';
import walletRoutes from './routes/wallet.routes';
import recurringRoutes from './routes/recurring.routes';
import userRoutes from './routes/user.routes';
import goalRoutes from './routes/goal.routes';
import debtRoutes from './routes/debt.routes';
import aiRoutes from './routes/ai.routes';
import cronRoutes from './routes/cron.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;
export const prisma = new PrismaClient();

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://finance-tracker-lake-omega.vercel.app',
    process.env.CLIENT_URL || ''
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/users', userRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/cron', cronRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}

export default app;
