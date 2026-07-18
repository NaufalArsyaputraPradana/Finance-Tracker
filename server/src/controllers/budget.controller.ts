import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';

export const getBudgets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { month, year } = req.query;

    const periodMonth = month ? parseInt(month as string) : new Date().getMonth() + 1;
    const periodYear = year ? parseInt(year as string) : new Date().getFullYear();

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        periodMonth,
        periodYear,
      },
      include: {
        category: true,
      },
    });

    res.json(budgets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBudgetStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Ambil budget bulan ini
    const budgets = await prisma.budget.findMany({
      where: { userId, periodMonth: currentMonth, periodYear: currentYear },
      include: { category: true }
    });

    // Hitung total pengeluaran tiap kategori bulan ini
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);

    const expenses = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'expense',
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _sum: {
        amount: true
      }
    });

    const status = budgets.map(budget => {
      const expense = expenses.find(e => e.categoryId === budget.categoryId);
      const spent = expense?._sum.amount ? Number(expense._sum.amount) : 0;
      const amount = Number(budget.amount);
      const percentage = (spent / amount) * 100;
      
      let statusColor = 'green';
      if (percentage >= budget.alertThreshold && percentage < 100) statusColor = 'yellow';
      if (percentage >= 100) statusColor = 'red';

      return {
        ...budget,
        spent,
        remaining: amount - spent,
        percentage: Math.min(percentage, 100), // Max 100% for progress bar
        statusColor,
      };
    });

    res.json(status);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { categoryId, amount, periodMonth, periodYear, alertThreshold } = req.body;

    // Check if budget already exists
    const existing = await prisma.budget.findFirst({
      where: { userId, categoryId, periodMonth, periodYear }
    });

    if (existing) {
      return res.status(400).json({ message: 'Budget for this category in this month already exists' });
    }

    const budget = await prisma.budget.create({
      data: {
        userId,
        categoryId,
        amount,
        periodMonth,
        periodYear,
        alertThreshold: alertThreshold || 80,
      },
      include: { category: true }
    });

    res.status(201).json(budget);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { amount, alertThreshold } = req.body;

    const existing = await prisma.budget.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const budget = await prisma.budget.update({
      where: { id },
      data: { amount, alertThreshold },
      include: { category: true }
    });

    res.json(budget);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const existing = await prisma.budget.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await prisma.budget.delete({ where: { id } });
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
