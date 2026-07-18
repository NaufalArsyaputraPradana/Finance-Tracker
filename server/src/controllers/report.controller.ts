import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth.middleware';
import ExcelJS from 'exceljs';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { id } from 'date-fns/locale';

export const getSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { month, year } = req.query;
    
    const targetDate = (month && year) 
      ? new Date(parseInt(year as string), parseInt(month as string) - 1, 1)
      : new Date();
      
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: start, lte: end }
      }
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += Number(t.amount);
      if (t.type === 'expense') totalExpense += Number(t.amount);
    });

    const balance = totalIncome - totalExpense;
    const savingRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

    res.json({ totalIncome, totalExpense, balance, savingRate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTrend = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const end = new Date();
    const start = subMonths(end, 11); // Last 12 months

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfMonth(start), lte: endOfMonth(end) }
      },
    });

    const monthlyData: { [key: string]: { income: number, expense: number } } = {};

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const key = format(d, 'MMM yyyy', { locale: id });
      monthlyData[key] = { income: 0, expense: 0 };
    }

    transactions.forEach(t => {
      const key = format(new Date(t.date), 'MMM yyyy', { locale: id });
      if (monthlyData[key]) {
        if (t.type === 'income') monthlyData[key].income += Number(t.amount);
        if (t.type === 'expense') monthlyData[key].expense += Number(t.amount);
      }
    });

    const result = Object.keys(monthlyData).map(key => ({
      name: key,
      Pemasukan: monthlyData[key].income,
      Pengeluaran: monthlyData[key].expense
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const exportExcel = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { month, year } = req.query;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    const targetDate = (month && year) 
      ? new Date(parseInt(year as string), parseInt(month as string) - 1, 1)
      : new Date();
      
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);

    const transactions = await prisma.transaction.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { category: true },
      orderBy: { date: 'desc' }
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Finance Tracker App';
    
    // Sheet 1: Transaksi
    const txSheet = workbook.addWorksheet('Daftar Transaksi');
    txSheet.columns = [
      { header: 'Tanggal', key: 'date', width: 15 },
      { header: 'Kategori', key: 'category', width: 20 },
      { header: 'Tipe', key: 'type', width: 15 },
      { header: 'Deskripsi', key: 'description', width: 30 },
      { header: 'Jumlah', key: 'amount', width: 20 },
    ];

    // Styling header
    txSheet.getRow(1).font = { bold: true };
    txSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEEEEE' } };

    transactions.forEach(tx => {
      txSheet.addRow({
        date: format(new Date(tx.date), 'dd/MM/yyyy'),
        category: tx.category.name,
        type: tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        description: tx.description || '-',
        amount: Number(tx.amount)
      });
    });

    // Formatting amount column as currency
    txSheet.getColumn('amount').numFmt = '#,##0.00';

    const periodName = format(targetDate, 'MMMM-yyyy', { locale: id });
    const fileName = `Laporan-Keuangan-${user?.name.replace(/\s+/g, '-')}-${periodName}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
