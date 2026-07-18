import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

export const getRecurringTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const recurring = await prisma.recurringTransaction.findMany({
      where: { userId },
      include: { category: true, wallet: true },
      orderBy: { nextRunDate: 'asc' }
    });
    res.json(recurring);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createRecurringTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { categoryId, walletId, type, amount, description, frequency, startDate, endDate } = req.body;

    // Calculate first run date
    const start = new Date(startDate);
    let nextRunDate = start;

    if (start < new Date()) {
      // If start date is in the past, adjust nextRunDate based on frequency
      // Simplification: we'll just set it to the start date and let the cron job catch up,
      // but to prevent massive spam, let's just make it run from today onwards
      nextRunDate = new Date();
    }

    const recurring = await prisma.recurringTransaction.create({
      data: {
        userId,
        categoryId,
        walletId: walletId || null,
        type,
        amount: Number(amount),
        description,
        frequency,
        startDate: start,
        endDate: endDate ? new Date(endDate) : null,
        nextRunDate,
        isActive: true
      },
      include: { category: true, wallet: true }
    });

    res.status(201).json(recurring);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateRecurringTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { isActive, frequency, amount, description, categoryId, walletId } = req.body;

    const existing = await prisma.recurringTransaction.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    const updated = await prisma.recurringTransaction.update({
      where: { id },
      data: {
        isActive,
        frequency,
        amount: amount ? Number(amount) : undefined,
        description,
        categoryId,
        walletId: walletId || null
      },
      include: { category: true, wallet: true }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteRecurringTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const existing = await prisma.recurringTransaction.findFirst({ where: { id, userId } });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    await prisma.recurringTransaction.delete({ where: { id } });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
