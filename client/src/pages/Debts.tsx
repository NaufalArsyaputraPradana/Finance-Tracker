import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Skeleton from '../components/ui/Skeleton';

interface Debt {
  id: string;
  personName: string;
  type: 'debt' | 'loan';
  amount: number;
  amountPaid: number;
  dueDate: string | null;
  status: 'pending' | 'paid';
  description: string | null;
}

export default function Debts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    personName: '',
    type: 'debt',
    amount: '',
    amountPaid: '0',
    dueDate: '',
    description: '',
    status: 'pending'
  });

  const fetchDebts = async () => {
    try {
      const res = await api.get('/debts');
      setDebts(res.data);
    } catch (error) {
      toast.error('Gagal mengambil data hutang/piutang');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Auto update status if fully paid
      const updatedForm = { ...formData };
      if (Number(updatedForm.amountPaid) >= Number(updatedForm.amount)) {
        updatedForm.status = 'paid';
      } else {
        updatedForm.status = 'pending';
      }

      if (editId) {
        await api.put(`/debts/${editId}`, updatedForm);
        toast.success('Data diperbarui');
      } else {
        await api.post('/debts', updatedForm);
        toast.success('Data berhasil ditambahkan');
      }
      setShowModal(false);
      fetchDebts();
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus catatan ini?')) {
      try {
        await api.delete(`/debts/${id}`);
        toast.success('Catatan dihapus');
        fetchDebts();
      } catch (error) {
        toast.error('Gagal menghapus');
      }
    }
  };

  const handleEdit = (debt: Debt) => {
    setEditId(debt.id);
    setFormData({
      personName: debt.personName,
      type: debt.type,
      amount: debt.amount.toString(),
      amountPaid: debt.amountPaid.toString(),
      dueDate: debt.dueDate ? debt.dueDate.split('T')[0] : '',
      description: debt.description || '',
      status: debt.status
    });
    setShowModal(true);
  };

  const markAsPaid = async (debt: Debt) => {
    try {
      await api.put(`/debts/${debt.id}`, {
        ...debt,
        amountPaid: debt.amount,
        status: 'paid'
      });
      toast.success(`${debt.type === 'debt' ? 'Hutang' : 'Piutang'} dilunasi!`);
      fetchDebts();
    } catch (error) {
      toast.error('Gagal memperbarui status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hutang & Piutang</h1>
          <p className="text-gray-500 dark:text-gray-400">Catat transaksi pinjaman dengan teman atau kerabat</p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setFormData({ personName: '', type: 'debt', amount: '', amountPaid: '0', dueDate: '', description: '', status: 'pending' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" /> Catat Baru
        </button>
      </div>

      {/* Summary Cards */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
            <h3 className="text-red-800 dark:text-red-400 font-medium mb-2">Total Hutang (Saya Pinjam)</h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-500">
              Rp {debts.filter(d => d.type === 'debt' && d.status === 'pending').reduce((acc, curr) => acc + (Number(curr.amount) - Number(curr.amountPaid)), 0).toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
            <h3 className="text-emerald-800 dark:text-emerald-400 font-medium mb-2">Total Piutang (Uang Saya)</h3>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500">
              Rp {debts.filter(d => d.type === 'loan' && d.status === 'pending').reduce((acc, curr) => acc + (Number(curr.amount) - Number(curr.amountPaid)), 0).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {debts.length === 0 ? (
              <li className="p-8 text-center text-gray-500 dark:text-gray-400">Belum ada catatan hutang/piutang</li>
            ) : (
              debts.map((debt) => (
                <li key={debt.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${debt.type === 'debt' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">{debt.personName}</h3>
                        {debt.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            <CheckCircle className="h-3 w-3" /> Lunas
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${debt.type === 'debt' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                            <Clock className="h-3 w-3" /> Belum Lunas
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {debt.type === 'debt' ? 'Saya berhutang' : 'Meminjam uang saya'}
                        {debt.dueDate && ` • Jatuh tempo: ${new Date(debt.dueDate).toLocaleDateString('id-ID')}`}
                      </p>
                      {debt.description && <p className="text-xs text-gray-400 mt-1">{debt.description}</p>}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-3 pl-14 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <p className={`text-lg font-bold ${debt.status === 'paid' ? 'text-gray-400 line-through' : (debt.type === 'debt' ? 'text-red-600 dark:text-red-500' : 'text-emerald-600 dark:text-emerald-500')}`}>
                        Rp {Number(debt.amount).toLocaleString('id-ID')}
                      </p>
                      {debt.status === 'pending' && Number(debt.amountPaid) > 0 && (
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Telah dibayar: Rp {Number(debt.amountPaid).toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {debt.status === 'pending' && (
                        <button 
                          onClick={() => markAsPaid(debt)}
                          className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors"
                        >
                          Tandai Lunas
                        </button>
                      )}
                      <button onClick={() => handleEdit(debt)} className="p-1.5 text-gray-400 hover:text-blue-500 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(debt.id)} className="p-1.5 text-gray-400 hover:text-red-500 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-xl border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {editId ? 'Update Catatan' : 'Catat Hutang/Piutang'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-4">
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.type === 'debt' ? 'bg-white dark:bg-gray-700 text-red-500 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                  onClick={() => setFormData({ ...formData, type: 'debt' })}
                >
                  Saya Berhutang
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.type === 'loan' ? 'bg-white dark:bg-gray-700 text-emerald-500 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                  onClick={() => setFormData({ ...formData, type: 'loan' })}
                >
                  Orang Ngutang
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Orang</label>
                <input
                  type="text"
                  required
                  value={formData.personName}
                  onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Budi, Andi, dsb."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Uang (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="100000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telah Dibayar (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formData.amountPaid}
                    onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jatuh Tempo (Opsional)</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keterangan (Opsional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  rows={2}
                  placeholder="Misal: Uang makan siang, tiket bioskop..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
