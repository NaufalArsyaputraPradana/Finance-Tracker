import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';

export const getWallets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    
    // Ambil semua wallet milik user
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      include: {
        transactions: {
          select: { type: true, amount: true }
        }
      }
    });

    // Kalkulasi current balance
    const walletsWithBalance = wallets.map(wallet => {
      let currentBalance = Number(wallet.initialBalance);
      
      wallet.transactions.forEach(tx => {
        if (tx.type === 'income') currentBalance += Number(tx.amount);
        if (tx.type === 'expense') currentBalance -= Number(tx.amount);
      });

      // Hapus data transactions dari response agar lebih ringan
      const { transactions, ...walletData } = wallet;
      return {
        ...walletData,
        currentBalance
      };
    });

    res.json(walletsWithBalance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createWallet = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, initialBalance, icon, color } = req.body;

    const wallet = await prisma.wallet.create({
      data: {
        userId,
        name,
        initialBalance: initialBalance || 0,
        icon,
        color
      }
    });

    res.status(201).json(wallet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateWallet = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { name, initialBalance, icon, color } = req.body;

    const existing = await prisma.wallet.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const wallet = await prisma.wallet.update({
      where: { id },
      data: { name, initialBalance, icon, color }
    });

    res.json(wallet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteWallet = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const existing = await prisma.wallet.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    await prisma.wallet.delete({ where: { id } });
    res.json({ message: 'Wallet deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
