import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getGoals = async (req: AuthRequest, res: Response) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' }
    });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals' });
  }
};

export const createGoal = async (req: AuthRequest, res: Response) => {
  try {
    const { name, targetAmount, targetDate, icon, color } = req.body;
    
    const goal = await prisma.goal.create({
      data: {
        userId: req.userId!,
        name,
        targetAmount: Number(targetAmount),
        savedAmount: 0,
        targetDate: targetDate ? new Date(targetDate) : null,
        icon,
        color
      }
    });
    
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error creating goal' });
  }
};

export const updateGoal = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, targetAmount, savedAmount, targetDate, icon, color } = req.body;
    
    const goal = await prisma.goal.update({
      where: { id, userId: req.userId! },
      data: {
        name,
        targetAmount: targetAmount !== undefined ? Number(targetAmount) : undefined,
        savedAmount: savedAmount !== undefined ? Number(savedAmount) : undefined,
        targetDate: targetDate ? new Date(targetDate) : undefined,
        icon,
        color
      }
    });
    
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal' });
  }
};

export const deleteGoal = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.goal.delete({
      where: { id, userId: req.userId! }
    });
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting goal' });
  }
};
