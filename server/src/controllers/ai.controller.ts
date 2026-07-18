import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const chatWithAI = async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    const userId = req.userId!;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Ambil data user secara umum untuk konteks AI
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallets: true,
      }
    });

    const totalBalance = user?.wallets.reduce((acc, curr) => acc + Number(curr.balance || curr.initialBalance), 0) || 0;

    const lowerMessage = message.toLowerCase();
    let reply = '';

    // Logika Simulasi AI sederhana (Heuristik)
    if (lowerMessage.includes('saldo') || lowerMessage.includes('uang')) {
      reply = `Saat ini total saldo dari seluruh dompet Anda adalah Rp ${totalBalance.toLocaleString('id-ID')}. Ingatlah untuk selalu menyisihkan minimal 20% untuk tabungan ya, ${user?.name?.split(' ')[0]}!`;
    } else if (lowerMessage.includes('boros') || lowerMessage.includes('pengeluaran')) {
      reply = `Untuk mengetahui apakah Anda boros, saya sarankan Anda mengecek menu **Laporan**. Bandingkan pengeluaran bulan ini dengan bulan lalu. Jika pengeluaran membengkak di kategori makanan, mungkin Anda harus mulai memasak sendiri.`;
    } else if (lowerMessage.includes('nabung') || lowerMessage.includes('tabungan') || lowerMessage.includes('hemat')) {
      reply = `Tips menabung yang baik adalah dengan metode 50/30/20. 50% untuk kebutuhan pokok, 30% untuk hiburan/keinginan, dan 20% untuk ditabung atau investasi. Anda bisa mencatat target tabungan di menu **Impian (Goals)**.`;
    } else if (lowerMessage.includes('halo') || lowerMessage.includes('hai')) {
      reply = `Halo ${user?.name}! Saya FinTrack AI, asisten keuangan pribadi Anda. Ada yang bisa saya bantu terkait analisis pengeluaran atau tips finansial hari ini?`;
    } else {
      reply = `Hmm, pertanyaan yang menarik! Sebagai asisten AI simulasi saat ini, saya memahami Anda menanyakan tentang "${message}". Terus gunakan aplikasi FinTrack untuk memantau keuangan Anda agar lebih sehat. Apakah ada hal spesifik lain tentang saldo atau pengeluaran yang ingin didiskusikan?`;
    }

    // Simulasi delay berfikir AI agar terasa realistis
    setTimeout(() => {
      res.json({ reply });
    }, 1500);

  } catch (error) {
    res.status(500).json({ message: 'Error communicating with AI' });
  }
};
