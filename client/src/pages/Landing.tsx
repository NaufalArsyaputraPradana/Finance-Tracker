import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ThemeToggle from '../components/ui/ThemeToggle';
import { 
  ChevronRight, BarChart3, ScanLine, Wallet, Repeat, 
  Smartphone, ShieldCheck, ArrowRight, CheckCircle2 
} from 'lucide-react';

export default function Landing() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for navbar glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-x-hidden font-sans transition-colors duration-300">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm py-3 border-b border-transparent dark:border-gray-800' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-blue-400 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              F
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              FinTrack
            </span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition-colors hidden sm:block">
              Masuk
            </Link>
            <Link to="/register" className="bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2">
              Mulai Gratis <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 bg-grid-pattern">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] bg-emerald-400/10 dark:bg-emerald-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="lg:w-1/2 space-y-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-primary text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Aplikasi Keuangan Generasi Baru
          </div>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
            Kendalikan Uangmu, <br />
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Kuasai Masa Depan.</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
            Catat pengeluaran tanpa ribet dengan AI, kelola banyak rekening sekaligus, dan capai target keuanganmu lebih cepat dari sebelumnya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/register" className="bg-primary hover:bg-blue-600 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-center text-lg">
              Coba FinTrack Gratis
            </Link>
          </div>
          <div className="flex items-center gap-4 pt-4 text-sm text-gray-500 font-medium">
            <div className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-500"/> Tanpa Kartu Kredit</div>
            <div className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-500"/> Batal Kapan Saja</div>
          </div>
        </div>

        <div className="lg:w-1/2 relative animate-fade-up animation-delay-200">
          <div className="relative z-10 bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 p-4 rounded-3xl shadow-2xl animate-float">
            {/* Fake Dashboard Mockup */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400 dark:bg-emerald-500"></div>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Saldo</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">Rp 12.500.000</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    +15% Bulan ini
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-2"><Wallet className="h-4 w-4 text-primary" /></div>
                    <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                  <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-2"><BarChart3 className="h-4 w-4 text-emerald-500" /></div>
                    <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaksi Terakhir</p>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700"></div>
                        <div className="space-y-1.5">
                          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-600 rounded"></div>
                          <div className="h-2 w-12 bg-gray-100 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-600 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating UI Elements */}
          <div className="absolute -left-12 top-20 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 animate-float animation-delay-300 z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-500 dark:text-emerald-400"><ScanLine className="w-5 h-5"/></div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Struk Otomatis</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Rp 150.000</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
            <h2 className="text-primary dark:text-blue-400 font-semibold tracking-wide uppercase text-sm mb-3">Fitur Unggulan</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Mencatat keuangan kini semudah tersenyum</h3>
            <p className="text-lg text-gray-600 dark:text-gray-400">FinTrack dilengkapi dengan berbagai fitur cerdas yang didesain khusus untuk menghemat waktu Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: ScanLine, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10', title: 'Scan Struk AI (OCR)', desc: 'Cukup foto struk belanja Anda, biarkan AI kami yang mendeteksi nominal totalnya secara otomatis.' },
              { icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', title: 'Multi-Rekening', desc: 'Pisahkan saldo BCA, Mandiri, GoPay, OVO, dan Dompet Tunai Anda dalam satu aplikasi.' },
              { icon: Repeat, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10', title: 'Transaksi Berulang', desc: 'Jadwalkan tagihan bulanan seperti listrik atau langganan Netflix, sistem akan mencatatnya otomatis.' },
              { icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', title: 'Grafik & Laporan', desc: 'Visualisasikan arus kas Anda dengan grafik interaktif. Export data ke Excel atau PDF dengan 1 klik.' },
              { icon: Smartphone, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-500/10', title: 'Progressive Web App', desc: 'Install langsung ke layar beranda HP Anda (Android/iOS) dan gunakan layaknya aplikasi native.' },
              { icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', title: 'Aman & Privat', desc: 'Data Anda dienkripsi dan diamankan dengan JWT Authentication berstandar industri.' }
            ].map((feature, idx) => (
              <div key={idx} className={`p-8 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-800 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-up animation-delay-${(idx % 3 + 1) * 100}`}>
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[100px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cara Kerja FinTrack</h2>
            <p className="text-xl text-gray-400">Mulai kelola keuangan Anda hanya dalam 3 langkah mudah.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0"></div>
            
            {[
              { step: '1', title: 'Buat Akun', desc: 'Daftar gratis kurang dari 1 menit tanpa kartu kredit.' },
              { step: '2', title: 'Catat Pengeluaran', desc: 'Gunakan fitur Scan Struk atau Import CSV untuk kepraktisan.' },
              { step: '3', title: 'Capai Tujuan', desc: 'Pantau grafik budget dan hemat uang Anda setiap bulannya.' }
            ].map((item, idx) => (
              <div key={idx} className={`relative text-center animate-fade-up animation-delay-${(idx+1)*100}`}>
                <div className="w-24 h-24 mx-auto bg-gray-800 border-4 border-gray-900 rounded-full flex items-center justify-center text-3xl font-extrabold text-primary mb-6 shadow-xl relative z-10">
                  {item.step}
                </div>
                <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-[2.5rem] p-12 text-center text-white shadow-2xl relative overflow-hidden animate-fade-up">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Siap mengubah cara Anda mengelola uang?</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">
              Bergabung dengan ribuan orang lainnya yang telah mencapai kebebasan finansial bersama FinTrack.
            </p>
            <div className="flex justify-center relative z-10">
              <Link to="/register" className="bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-100 transition-all hover:shadow-xl hover:-translate-y-1 flex items-center gap-2">
                Daftar Sekarang <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-950 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-md">
              F
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">FinTrack.</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Finance Tracker App. Dibuat dengan ❤️ untuk proyek portofolio.
          </p>
          <div className="flex gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
            <a href="#" className="hover:text-primary dark:hover:text-primary transition-colors">Privasi</a>
            <a href="#" className="hover:text-primary dark:hover:text-primary transition-colors">Syarat</a>
            <a href="#" className="hover:text-primary dark:hover:text-primary transition-colors">Kontak</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
