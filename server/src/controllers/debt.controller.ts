import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getDebts = async (req: AuthRequest, res: Response) => {
  try {
    const debts = await prisma.debt.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' }
    });
    res.json(debts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching debts' });
  }
};

export const createDebt = async (req: AuthRequest, res: Response) => {
  try {
    const { personName, type, amount, dueDate, description } = req.body;
    
    const debt = await prisma.debt.create({
      data: {
        userId: req.userId!,
        personName,
        type, // 'debt' or 'loan'
        amount: Number(amount),
        amountPaid: 0,
        dueDate: dueDate ? new Date(dueDate) : null,
        description
      }
    });
    
    res.status(201).json(debt);
  } catch (error) {
    res.status(500).json({ message: 'Error creating debt' });
  }
};

export const updateDebt = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { personName, type, amount, amountPaid, dueDate, status, description } = req.body;
    
    const debt = await prisma.debt.update({
      where: { id, userId: req.userId! },
      data: {
        personName,
        type,
        amount: amount !== undefined ? Number(amount) : undefined,
        amountPaid: amountPaid !== undefined ? Number(amountPaid) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status, // 'pending' or 'paid'
        description
      }
    });
    
    res.json(debt);
  } catch (error) {
    res.status(500).json({ message: 'Error updating debt' });
  }
};

export const deleteDebt = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.debt.delete({
      where: { id, userId: req.userId! }
    });
    res.json({ message: 'Debt deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting debt' });
  }
};
