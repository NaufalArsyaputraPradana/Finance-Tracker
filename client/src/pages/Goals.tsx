import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, Edit, TrendingUp } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Skeleton from '../components/ui/Skeleton';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string | null;
  icon: string | null;
  color: string | null;
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    savedAmount: '0',
    targetDate: '',
    icon: '🎯',
    color: '#8b5cf6'
  });

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (error) {
      toast.error('Gagal mengambil data impian');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/goals/${editId}`, formData);
        toast.success('Impian diperbarui');
      } else {
        await api.post('/goals', formData);
        toast.success('Impian baru ditambahkan');
      }
      setShowModal(false);
      fetchGoals();
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus impian ini?')) {
      try {
        await api.delete(`/goals/${id}`);
        toast.success('Impian dihapus');
        fetchGoals();
      } catch (error) {
        toast.error('Gagal menghapus impian');
      }
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditId(goal.id);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      savedAmount: goal.savedAmount.toString(),
      targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : '',
      icon: goal.icon || '🎯',
      color: goal.color || '#8b5cf6'
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Target Impian</h1>
          <p className="text-gray-500 dark:text-gray-400">Wujudkan mimpimu satu langkah demi satu langkah</p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setFormData({ name: '', targetAmount: '', savedAmount: '0', targetDate: '', icon: '🎯', color: '#8b5cf6' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" /> Tambah Impian
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
              <Skeleton className="h-12 w-12 rounded-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const percentage = Math.min(100, Math.round((Number(goal.savedAmount) / Number(goal.targetAmount)) * 100));
            
            return (
              <div key={goal.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 group hover:shadow-md transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 transition-transform group-hover:scale-110 pointer-events-none" style={{ backgroundColor: goal.color || '#8b5cf6', filter: 'blur(40px)' }}></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm" style={{ backgroundColor: `${goal.color || '#8b5cf6'}20` }}>
                      {goal.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{goal.name}</h3>
                      {goal.targetDate && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Target: {new Date(goal.targetDate).toLocaleDateString('id-ID')}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(goal)} className="p-2 text-gray-400 hover:text-blue-500 rounded-lg">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 relative z-10">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">Rp {Number(goal.savedAmount).toLocaleString('id-ID')}</span>
                    <span className="text-gray-500 dark:text-gray-400">Rp {Number(goal.targetAmount).toLocaleString('id-ID')}</span>
                  </div>
                  
                  {/* Progress Bar with animation */}
                  <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${percentage}%`, backgroundColor: goal.color || '#8b5cf6' }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-medium px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                      {percentage}% Terkumpul
                    </span>
                    <button 
                      onClick={() => handleEdit(goal)}
                      className="text-xs text-primary hover:text-blue-600 font-medium flex items-center gap-1"
                    >
                      <TrendingUp className="h-3 w-3" /> Tambah Dana
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-xl border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {editId ? 'Update Impian' : 'Tambah Impian Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Impian</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="Macbook Pro, Rumah, Liburan..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Dana (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="25000000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Terkumpul (Rp)</label>
                  <input
                    type="number"
                    required
                    value={formData.savedAmount}
                    onChange={(e) => setFormData({ ...formData, savedAmount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tenggat Waktu (Opsional)</label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ikon (Emoji)</label>
                  <input
                    type="text"
                    required
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-center text-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warna</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="h-10 w-14 rounded cursor-pointer border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none uppercase font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
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
                  Simpan Impian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
