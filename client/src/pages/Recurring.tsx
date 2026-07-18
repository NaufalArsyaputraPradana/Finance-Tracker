import React, { useState, useEffect } from 'react';
import { Plus, Repeat, Trash2, Calendar, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import Skeleton from '../components/ui/Skeleton';
import api from '../services/api';

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
}

interface Wallet {
  id: string;
  name: string;
  color: string;
}

interface RecurringTx {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  nextRunDate: string;
  isActive: boolean;
  category: Category;
  wallet?: Wallet;
}

export default function Recurring() {
  const [transactions, setTransactions] = useState<RecurringTx[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    categoryId: '',
    walletId: '',
    description: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recRes, catRes, walRes] = await Promise.all([
        api.get('/recurring'),
        api.get('/categories'),
        api.get('/wallets')
      ]);
      setTransactions(recRes.data);
      setCategories(catRes.data);
      setWallets(walRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/recurring', {
        ...formData,
        amount: Number(formData.amount)
      });
      setShowModal(false);
      setFormData({
        type: 'expense',
        amount: '',
        categoryId: '',
        walletId: '',
        description: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
      toast.success('Jadwal rutin berhasil dibuat');
      fetchData();
    } catch (error) {
      console.error('Error creating recurring transaction', error);
      toast.error('Gagal membuat transaksi berulang');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus jadwal transaksi ini? (Transaksi yang sudah terjadi tidak akan terhapus)')) {
      try {
        await api.delete(`/recurring/${id}`);
        toast.success('Jadwal rutin dihapus');
        fetchData();
      } catch (error) {
        toast.error('Gagal menghapus');
      }
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/recurring/${id}`, { isActive: !currentStatus });
      toast.success(currentStatus ? 'Jadwal dinonaktifkan' : 'Jadwal diaktifkan');
      fetchData();
    } catch (error) {
      toast.error('Gagal mengubah status');
    }
  };

  const filteredCategories = categories.filter(c => c.type === formData.type);
  const frequencyLabels: Record<string, string> = {
    daily: 'Harian',
    weekly: 'Mingguan',
    monthly: 'Bulanan',
    yearly: 'Tahunan'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaksi Berulang</h1>
          <p className="text-gray-500">Jadwalkan tagihan atau pemasukan rutin otomatis</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-5 w-5" /> Buat Jadwal
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-48 flex flex-col justify-between">
              <div className="flex gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-full mt-4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {transactions.map((tx) => (
            <div key={tx.id} className={`bg-white p-6 rounded-2xl shadow-sm border ${tx.isActive ? 'border-gray-100' : 'border-gray-200 opacity-60'} flex flex-col relative`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                    <Repeat className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{tx.description || tx.category.name}</h3>
                    <p className="text-sm text-gray-500">{frequencyLabels[tx.frequency]}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleActive(tx.id, tx.isActive)} className={`p-2 rounded-lg transition-colors ${tx.isActive ? 'text-primary hover:bg-blue-50' : 'text-gray-400 hover:bg-gray-100'}`} title={tx.isActive ? 'Nonaktifkan' : 'Aktifkan'}>
                    <Power className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(tx.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <p className={`text-2xl font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {tx.type === 'income' ? '+' : '-'} Rp {Number(tx.amount).toLocaleString('id-ID')}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium" style={{ backgroundColor: `${tx.category.color}20`, color: tx.category.color }}>
                    {tx.category.name}
                  </span>
                  {tx.wallet && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tx.wallet.color }}></span>
                      {tx.wallet.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Jadwal Berikutnya: <strong className="text-gray-700">{new Date(tx.nextRunDate).toLocaleDateString('id-ID')}</strong></span>
              </div>
            </div>
          ))}

          {transactions.length === 0 && (
            <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-50 text-purple-500 mb-4">
                <Repeat className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada transaksi berulang</h3>
              <p className="text-gray-500 mb-6">Jadwalkan pembayaran tagihan, langganan Netflix, atau pemasukan bulanan otomatis.</p>
              <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">Buat Jadwal Pertama</button>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Buat Jadwal Transaksi</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.type === 'expense' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  onClick={() => setFormData({...formData, type: 'expense', categoryId: ''})}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.type === 'income' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  onClick={() => setFormData({...formData, type: 'income', categoryId: ''})}
                >
                  Pemasukan
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                  placeholder="0"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="">Pilih Kategori</option>
                    {filteredCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dompet</label>
                  <select
                    value={formData.walletId}
                    onChange={(e) => setFormData({...formData, walletId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="">Pilih Dompet</option>
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frekuensi</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="daily">Harian</option>
                  <option value="weekly">Mingguan</option>
                  <option value="monthly">Bulanan</option>
                  <option value="yearly">Tahunan</option>
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mulai Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selesai (Opsional)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                  placeholder="Misal: Tagihan Netflix"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">Simpan Jadwal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
