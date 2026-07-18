import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

const router = Router();

// Vercel Cron Job endpoint
// Secure it by checking for the Vercel Cron Authorization header in production
router.get('/recurring', async (req: Request, res: Response) => {
  // Authentication check for Vercel Cron
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  console.log('Running recurring transactions cron job via API...');
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueTransactions = await prisma.recurringTransaction.findMany({
      where: {
        isActive: true,
        nextRunDate: { lte: today },
        OR: [
          { endDate: null },
          { endDate: { gte: today } }
        ]
      }
    });

    for (const rt of dueTransactions) {
      // Create actual transaction
      await prisma.transaction.create({
        data: {
          userId: rt.userId,
          categoryId: rt.categoryId,
          walletId: rt.walletId,
          type: rt.type,
          amount: rt.amount,
          description: `[Auto] ${rt.description || ''}`,
          date: new Date()
        }
      });

      // Calculate next run date
      let nextDate = new Date(rt.nextRunDate);
      if (rt.frequency === 'daily') nextDate = addDays(nextDate, 1);
      else if (rt.frequency === 'weekly') nextDate = addWeeks(nextDate, 1);
      else if (rt.frequency === 'monthly') nextDate = addMonths(nextDate, 1);
      else if (rt.frequency === 'yearly') nextDate = addYears(nextDate, 1);

      // If for some reason nextDate is still in the past, skip forward
      while (nextDate <= today) {
        if (rt.frequency === 'daily') nextDate = addDays(nextDate, 1);
        else if (rt.frequency === 'weekly') nextDate = addWeeks(nextDate, 1);
        else if (rt.frequency === 'monthly') nextDate = addMonths(nextDate, 1);
        else if (rt.frequency === 'yearly') nextDate = addYears(nextDate, 1);
      }

      await prisma.recurringTransaction.update({
        where: { id: rt.id },
        data: { nextRunDate: nextDate }
      });
    }
    
    console.log(`Processed ${dueTransactions.length} recurring transactions.`);
    res.json({ message: `Processed ${dueTransactions.length} recurring transactions.` });
  } catch (error) {
    console.error('Error in cron route:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
