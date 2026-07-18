import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Trash2, Edit, Upload, Camera, Loader2, Filter } from 'lucide-react';
import Papa from 'papaparse';
import Tesseract from 'tesseract.js';
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

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category: Category;
  wallet?: Wallet;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    categoryId: '',
    walletId: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, catRes, walRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/categories'),
        api.get('/wallets')
      ]);
      setTransactions(txRes.data);
      setCategories(catRes.data);
      setWallets(walRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tx: Transaction) => {
    setEditId(tx.id);
    setFormData({
      type: tx.type,
      amount: tx.amount.toString(),
      categoryId: tx.category.id,
      walletId: tx.wallet?.id || '',
      date: tx.date.split('T')[0],
      description: tx.description
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
        ...formData,
        amount: Number(formData.amount)
      };
    try {
      if (editId) {
        await api.put(`/transactions/${editId}`, payload);
        toast.success('Transaksi berhasil diubah');
      } else {
        await api.post('/transactions', payload);
        toast.success('Transaksi berhasil ditambahkan');
      }
      setShowModal(false);
      setEditId(null);
      setFormData({ type: 'expense', amount: '', categoryId: '', walletId: '', date: new Date().toISOString().split('T')[0], description: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving transaction', error);
      toast.error('Gagal menyimpan transaksi');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus transaksi ini?')) {
      try {
        await api.delete(`/transactions/${id}`);
        toast.success('Transaksi dihapus');
        fetchData();
      } catch (error) {
        toast.error('Gagal menghapus transaksi');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsedData = results.data as any[];
          
          const bulkTransactions = parsedData.map(row => {
            const category = categories.find(c => c.name.toLowerCase() === (row.CategoryName || '').toLowerCase());
            const wallet = wallets.find(w => w.name.toLowerCase() === (row.WalletName || '').toLowerCase());
            
            return {
              type: row.Type?.toLowerCase() === 'income' ? 'income' : 'expense',
              amount: Number(row.Amount) || 0,
              description: row.Description || '',
              date: row.Date || new Date().toISOString(),
              categoryId: category?.id,
              walletId: wallet?.id
            };
          }).filter(tx => tx.categoryId && tx.amount > 0);

          if (bulkTransactions.length === 0) {
            toast.error('Tidak ada data valid yang bisa diimport.');
            return;
          }

          await api.post('/transactions/bulk', bulkTransactions);
          toast.success(`${bulkTransactions.length} transaksi berhasil diimport!`);
          setShowImportModal(false);
          fetchData();
        } catch (error) {
          console.error('Import error', error);
          toast.error('Terjadi kesalahan saat mengimport data');
        }
      }
    });
  };

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const result = await Tesseract.recognize(file, 'eng+ind', {
        logger: m => console.log(m)
      });
      
      const text = result.data.text;
      const numberMatches = text.match(/\b\d{1,3}(?:\.\d{3})*(?:,\d{2})?\b/g);
      
      if (numberMatches && numberMatches.length > 0) {
        const numbers = numberMatches.map(str => {
          const cleanStr = str.replace(/\./g, '').replace(',', '.');
          return Number(cleanStr);
        }).filter(n => n > 100);

        if (numbers.length > 0) {
          const maxNumber = Math.max(...numbers);
          setFormData(prev => ({ ...prev, amount: maxNumber.toString() }));
          toast.success(`Berhasil mendeteksi nominal: Rp ${maxNumber.toLocaleString('id-ID')}`);
        } else {
          toast.error('Tidak dapat menemukan nominal yang valid di struk.');
        }
      } else {
        toast.error('Teks tidak terbaca. Pastikan foto terang dan fokus.');
      }
    } catch (error) {
      console.error('OCR Error', error);
      toast.error('Gagal memindai struk.');
    } finally {
      setIsScanning(false);
      if (receiptInputRef.current) receiptInputRef.current.value = '';
    }
  };

  const filteredCategories = categories.filter(c => c.type === formData.type);

  // Filter Table Data
  const filteredTransactions = transactions.filter(tx => {
    const matchSearch = tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        tx.category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMonth = filterMonth ? tx.date.startsWith(filterMonth) : true;
    return matchSearch && matchMonth;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Upload className="h-5 w-5 text-gray-400" /> Import CSV
          </button>
          <button
            onClick={() => {
              setEditId(null);
              setFormData({ type: 'expense', amount: '', categoryId: '', walletId: '', date: new Date().toISOString().split('T')[0], description: '' });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" /> Tambah Transaksi
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white"
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <input 
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-gray-700 dark:text-gray-300"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4 p-4 border-b border-gray-50 dark:border-gray-800">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
              <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 rounded-tl-xl">Tanggal</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Dompet</th>
                  <th className="px-6 py-4">Deskripsi</th>
                  <th className="px-6 py-4 text-right">Jumlah</th>
                  <th className="px-6 py-4 text-right rounded-tr-xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-blue-50/50 dark:hover:bg-gray-800 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(tx.date).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'})}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${tx.category.color}20`, color: tx.category.color }}>
                        {tx.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                      {tx.wallet ? (
                        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.wallet.color }}></span>{tx.wallet.name}</span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium truncate max-w-[200px]">{tx.description || '-'}</td>
                    <td className={`px-6 py-4 text-right whitespace-nowrap font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {tx.type === 'income' ? '+' : '-'} Rp {Number(tx.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(tx)} className="text-gray-400 hover:text-blue-500 transition-colors p-1 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(tx.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Search className="h-10 w-10 text-gray-300 mb-3" />
                        <p>Tidak ada transaksi ditemukan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tambah Transaksi</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.type === 'expense' ? 'bg-white dark:bg-gray-700 text-red-500 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                  onClick={() => setFormData({...formData, type: 'expense', categoryId: ''})}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${formData.type === 'income' ? 'bg-white dark:bg-gray-700 text-emerald-500 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                  onClick={() => setFormData({...formData, type: 'income', categoryId: ''})}
                >
                  Pemasukan
                </button>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jumlah (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-primary focus:border-primary outline-none"
                    placeholder="0"
                  />
                </div>
                
                {formData.type === 'expense' && (
                  <div className="flex-none">
                    <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                    <input type="file" accept="image/*" capture="environment" className="hidden" ref={receiptInputRef} onChange={handleScanReceipt} />
                    <button
                      type="button"
                      disabled={isScanning}
                      onClick={() => receiptInputRef.current?.click()}
                      className="h-10 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                      title="Scan Struk Belanja"
                    >
                      {isScanning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
                      <span className="hidden sm:inline">{isScanning ? 'Membaca...' : 'Scan Struk'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="">Pilih Kategori</option>
                    {filteredCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dompet</label>
                  <select
                    value={formData.walletId}
                    onChange={(e) => setFormData({...formData, walletId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="">Pilih Dompet</option>
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-primary focus:border-primary outline-none"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Import Transaksi (CSV)</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm">
                <p className="font-semibold mb-2">Format CSV yang didukung:</p>
                <p>Header (Baris 1): <code>Date,Type,Amount,Description,CategoryName,WalletName</code></p>
                <ul className="list-disc ml-5 mt-2 opacity-80">
                  <li><strong>Type</strong>: <code>income</code> atau <code>expense</code></li>
                  <li><strong>Date</strong>: format <code>YYYY-MM-DD</code></li>
                  <li><strong>CategoryName</strong>: harus persis dengan nama Kategori Anda</li>
                </ul>
              </div>
              
              <div>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary hover:bg-blue-50 transition-colors text-gray-500 hover:text-primary"
                >
                  <Upload className="h-8 w-8" />
                  <span className="font-medium">Pilih File CSV</span>
                </button>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowImportModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg w-full">Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
