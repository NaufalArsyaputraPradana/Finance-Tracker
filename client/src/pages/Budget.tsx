import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Skeleton from '../components/ui/Skeleton';
import api from '../services/api';

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Budget {
  id: string;
  amount: number;
  spent: number;
  remaining: number;
  percentage: number;
  statusColor: string;
  category: Category;
}

export default function Budget() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    alertThreshold: '80'
  });

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        api.get('/budgets/status'),
        api.get('/categories')
      ]);
      setBudgets(bRes.data);
      // Hanya kategori pengeluaran untuk budget
      setCategories(cRes.data.filter((c: any) => c.type === 'expense'));
    } catch (error) {
      console.error('Error fetching budgets', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/budgets', {
        categoryId: formData.categoryId,
        amount: Number(formData.amount),
        alertThreshold: Number(formData.alertThreshold),
        periodMonth: currentMonth,
        periodYear: currentYear
      });
      toast.success('Budget berhasil ditambahkan');
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuat budget');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus budget ini?')) {
      try {
        await api.delete(`/budgets/${id}`);
        toast.success('Budget berhasil dihapus');
        fetchData();
      } catch (error) {
        toast.error('Gagal menghapus budget');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Perencanaan Budget</h1>
          <p className="text-gray-500">Bulan ini: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-5 w-5" /> Buat Budget Baru
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-1/4" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-500 mb-4">
            <Plus className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada budget bulan ini</h3>
          <p className="text-gray-500 mb-6">Buat batas pengeluaran untuk kategori tertentu agar keuangan lebih terkontrol.</p>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">Buat Budget Pertama</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {budgets.map((budget) => (
            <div key={budget.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: `${budget.category.color}20` }}>
                    {budget.category.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{budget.category.name}</h3>
                    <p className="text-xs text-gray-500">
                      Sisa: <span className="font-medium text-gray-900">Rp {budget.remaining.toLocaleString('id-ID')}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    Rp {budget.spent.toLocaleString('id-ID')} / Rp {budget.amount.toLocaleString('id-ID')}
                  </span>
                  <button onClick={() => handleDelete(budget.id)} className="p-1 text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                    budget.statusColor === 'red' ? 'bg-red-500' :
                    budget.statusColor === 'yellow' ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${budget.percentage}%` }}
                ></div>
              </div>
              
              {budget.statusColor === 'red' && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-red-500 font-medium">
                  <AlertCircle className="h-4 w-4" /> Budget terlampaui!
                </div>
              )}
              {budget.statusColor === 'yellow' && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-500 font-medium">
                  <AlertCircle className="h-4 w-4" /> Mendekati batas (di atas {formData.alertThreshold}%)
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Buat Budget */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Buat Budget Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Pengeluaran</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batas Maksimal (Rp)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batas Peringatan (%)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={formData.alertThreshold}
                  onChange={(e) => setFormData({...formData, alertThreshold: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Peringatan warna kuning jika pemakaian melewati persentase ini.</p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">Simpan Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
