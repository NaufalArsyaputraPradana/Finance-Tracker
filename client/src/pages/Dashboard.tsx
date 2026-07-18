import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Skeleton from '../components/ui/Skeleton';
import { Award, Trophy, Star, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, savingRate: 0 });
  const [trendData, setTrendData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, trendRes, txRes] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/reports/trend'),
        api.get('/transactions')
      ]);
      setSummary(sumRes.data);
      setTrendData(trendRes.data.slice(6));
      
      // Ambil 5 transaksi terakhir (asumsi API mengembalikan urutan terbaru)
      setRecentTransactions(txRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Selamat datang kembali, <span className="font-medium text-gray-900 dark:text-white">{user?.name}</span>!</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <Skeleton className="h-6 w-1/3 mb-6" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pemasukan</h3>
                <p className="text-2xl font-bold text-emerald-500 dark:text-emerald-400 mt-2">Rp {summary.totalIncome.toLocaleString('id-ID')}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pengeluaran</h3>
                <p className="text-2xl font-bold text-red-500 dark:text-red-400 mt-2">Rp {summary.totalExpense.toLocaleString('id-ID')}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Arus Kas (6 Bulan Terakhir)</h3>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                    <YAxis hide={true} />
                    <Tooltip 
                      formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="Pemasukan" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Pengeluaran" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Transaksi Terbaru</h3>
              {recentTransactions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">Belum ada transaksi</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                    <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-xl">Tanggal</th>
                        <th className="px-4 py-3">Deskripsi</th>
                        <th className="px-4 py-3 text-right rounded-tr-xl">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {recentTransactions.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">{new Date(tx.date).toLocaleDateString('id-ID', {day:'numeric', month:'short'})}</td>
                          <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{tx.description || '-'}</td>
                          <td className={`px-4 py-3 text-right whitespace-nowrap font-bold ${tx.type === 'income' ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                            {tx.type === 'income' ? '+' : '-'} Rp {Number(tx.amount).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" /> Pencapaian Anda
              </h2>
              <span className="text-xs text-primary font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">Level 3</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30 text-center">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mb-2 shadow-sm text-amber-600">
                  <Star className="h-5 w-5 fill-amber-500" />
                </div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-white">Raja Hemat</h3>
              </div>
              
              <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 text-center">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-2 shadow-sm text-blue-600">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-white">Konsisten</h3>
              </div>

              <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-center opacity-50 grayscale">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 shadow-sm text-gray-500">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-gray-900 dark:text-white">Miliarder</h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
