import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all categories for a user
export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new category
export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, type, icon, color } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }

    const category = await prisma.category.create({
      data: {
        userId,
        name,
        type, // 'income' or 'expense'
        icon,
        color,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a category
export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { name, type, icon, color } = req.body;

    // Check if it belongs to user
    const existing = await prisma.category.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, type, icon, color },
    });

    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a category
export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const existing = await prisma.category.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (existing.isDefault) {
      return res.status(400).json({ message: 'Cannot delete default category' });
    }

    // Check if category is used in transactions
    const transactionCount = await prisma.transaction.count({
      where: { categoryId: id },
    });

    if (transactionCount > 0) {
      return res.status(400).json({ message: 'Cannot delete category that has transactions' });
    }

    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
