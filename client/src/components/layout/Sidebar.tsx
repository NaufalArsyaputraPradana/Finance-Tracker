import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  Tags, 
  PieChart, 
  FileText, 
  CreditCard,
  Settings,
  RefreshCw,
  LogOut,
  Target,
  Users,
  Bot,
  Download
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../ui/ThemeToggle';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: CreditCard, label: 'Rekening', path: '/wallets' },
  { icon: Receipt, label: 'Transaksi', path: '/transactions' },
  { icon: RefreshCw, label: 'Jadwal Rutin', path: '/recurring' },
  { icon: Target, label: 'Target Impian', path: '/goals' },
  { icon: Users, label: 'Hutang / Piutang', path: '/debts' },
  { icon: Tags, label: 'Kategori', path: '/categories' },
  { icon: PieChart, label: 'Anggaran', path: '/budget' },
  { icon: FileText, label: 'Laporan', path: '/reports' },
  { icon: Bot, label: 'Tanya AI', path: '/assistant' },
  { icon: Settings, label: 'Pengaturan', path: '/settings' },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user, logout: handleLogout } = useAuthStore();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  return (
    <div className="w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-100 dark:border-gray-800 flex flex-col h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)] z-10 transition-colors duration-300">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
          FinTrack<span className="text-primary">.</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-50/80 dark:bg-blue-900/30 text-primary font-semibold shadow-sm border border-blue-100/50 dark:border-blue-800'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        {deferredPrompt && (
          <button 
            onClick={handleInstallClick}
            className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-primary text-white rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">Install App</span>
          </button>
        )}

        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tema</span>
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-colors group"
        >
          <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </div>
  );
}
