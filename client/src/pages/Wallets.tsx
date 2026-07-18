import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Wallet as WalletIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Skeleton from '../components/ui/Skeleton';
import api from '../services/api';

interface Wallet {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  icon: string;
  color: string;
}

export default function Wallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    initialBalance: '',
    color: '#3b82f6',
    icon: '💳'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/wallets');
      setWallets(res.data);
    } catch (error) {
      console.error('Error fetching wallets', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/wallets', {
        ...formData,
        initialBalance: Number(formData.initialBalance)
      });
      setShowModal(false);
      setFormData({ name: '', initialBalance: '', color: '#3b82f6', icon: '💳' });
      toast.success('Dompet berhasil ditambahkan');
      fetchData();
    } catch (error) {
      console.error('Error creating wallet', error);
      toast.error('Gagal menambah dompet/akun bank');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Menghapus dompet ini akan membuat transaksi yang terkait kehilangan data dompet. Lanjutkan?')) {
      try {
        await api.delete(`/wallets/${id}`);
        toast.success('Dompet berhasil dihapus');
        fetchData();
      } catch (error) {
        toast.error('Gagal menghapus dompet');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dompet & Akun Bank</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola sumber dana transaksi Anda</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-5 w-5" /> Tambah Akun
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm h-40 flex flex-col justify-between">
              <div className="flex gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
              <Skeleton className="h-8 w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col relative overflow-hidden group">
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"
                style={{ backgroundColor: wallet.color }}
              ></div>
              
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner"
                    style={{ backgroundColor: `${wallet.color}20`, border: `1px solid ${wallet.color}40` }}
                  >
                    {wallet.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{wallet.name}</h3>
                    <p className="text-xs text-gray-400">Multi-wallet Account</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(wallet.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2 z-10">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mt-auto">
                <p className="text-sm font-medium text-gray-500 mb-1">Saldo Saat Ini</p>
                <p className="text-3xl font-bold text-gray-900">Rp {wallet.currentBalance.toLocaleString('id-ID')}</p>
              </div>
            </div>
          ))}

          {wallets.length === 0 && (
            <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-500 mb-4">
                <WalletIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada dompet terdaftar</h3>
              <p className="text-gray-500 mb-6">Tambahkan dompet digital (Gopay, OVO) atau rekening bank (BCA, Mandiri) untuk memisahkan pencatatan saldo Anda.</p>
              <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">Tambah Dompet Pertama</button>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Tambah Dompet / Bank</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Akun / Dompet</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                  placeholder="Misal: BCA, Kas Tunai, GoPay"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Awal (Rp)</label>
                <input
                  type="number"
                  required
                  value={formData.initialBalance}
                  onChange={(e) => setFormData({...formData, initialBalance: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                  placeholder="0"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warna</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="w-full h-10 p-1 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emoji / Ikon</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary outline-none text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
