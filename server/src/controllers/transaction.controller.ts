import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all transactions for a user
export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    // In a real app, you would add pagination and filtering here
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { category: true, wallet: true },
      orderBy: { date: 'desc' },
    });
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new transaction
export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { categoryId, walletId, type, amount, description, date, attachment } = req.body;

    if (!categoryId || !type || !amount || !date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        categoryId,
        walletId: walletId || null,
        type, // 'income' or 'expense'
        amount,
        description,
        date: new Date(date),
        attachment,
      },
      include: { category: true, wallet: true }
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a transaction
export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { categoryId, walletId, type, amount, description, date, attachment } = req.body;

    const existing = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        categoryId,
        walletId: walletId || null,
        type,
        amount,
        description,
        date: date ? new Date(date) : undefined,
        attachment,
      },
      include: { category: true, wallet: true }
    });

    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a transaction
export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const existing = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await prisma.transaction.delete({ where: { id } });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Create multiple transactions (Bulk Import CSV)
export const createBulkTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const transactions = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    const created = await prisma.$transaction(
      transactions.map(tx => prisma.transaction.create({
        data: {
          userId,
          categoryId: tx.categoryId,
          walletId: tx.walletId || null,
          type: tx.type,
          amount: Number(tx.amount),
          description: tx.description,
          date: new Date(tx.date),
        }
      }))
    );

    res.status(201).json({ message: `${created.length} transactions created successfully`, count: created.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error bulk insert' });
  }
};
