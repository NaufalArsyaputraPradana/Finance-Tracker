import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Rocket, ArrowRight } from 'lucide-react';

export default function PromoPopups() {
  const [showSmall, setShowSmall] = useState(false);
  const [showLarge, setShowLarge] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const location = useLocation();

  useEffect(() => {
    // Hanya tampilkan promo di halaman utama (opsional, tapi disarankan)
    if (location.pathname !== '/') return;

    // ===== SMALL PROMO POPUP =====
    const smallClosed = localStorage.getItem('promo_closed');
    if (!smallClosed) {
      setShowSmall(false); // Reset state
      const smallTimer = setTimeout(() => {
        setShowSmall(true);
      }, 2500); // Tampil setelah 2.5 detik
      return () => clearTimeout(smallTimer);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/') return;

    // ===== LARGE PROMO POPUP =====
    const largeClosed = sessionStorage.getItem('large_promo_closed');
    
    if (!largeClosed) {
      setShowLarge(false); // Reset state
      const largeTimer = setTimeout(() => {
        setShowLarge(true);
        
        // Start countdown timer (5 seconds)
        let time = 5;
        setTimeLeft(time);
        
        const countdown = setInterval(() => {
          time -= 1;
          setTimeLeft(Math.max(0, time));
          if (time <= 0) {
            clearInterval(countdown);
            handleCloseLarge();
          }
        }, 1000);

        return () => clearInterval(countdown);
      }, 1000); // Tampil setelah 1 detik

      return () => clearTimeout(largeTimer);
    }
  }, [location.pathname]);

  const handleCloseSmall = () => {
    setShowSmall(false);
    localStorage.setItem('promo_closed', 'true');
  };

  const handleCloseLarge = () => {
    setShowLarge(false);
    sessionStorage.setItem('large_promo_closed', 'true');
  };

  return (
    <>
      {/* Promo Popup Ad (Small Corner) */}
      <div 
        className={`fixed bottom-6 left-6 z-[60] transition-all duration-700 w-80 hidden sm:block ${
          showSmall ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0 pointer-events-none'
        }`}
      >
        <div className="relative bg-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-2xl shadow-blue-900/40 overflow-hidden group">
          {/* Glow background */}
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500"></div>

          <button 
            onClick={handleCloseSmall} 
            className="absolute top-3 right-3 text-slate-400 hover:text-white z-10 transition-colors"
          >
            <X size={16} />
          </button>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Rocket className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">Explore More!</h4>
                <p className="text-xs text-blue-400">Karya Saya Lainnya</p>
              </div>
            </div>

            <p className="text-slate-300 text-xs mb-4 leading-relaxed">
              Tertarik melihat eksperimen desain dan solusi inovatif dari karya saya yang lain?
            </p>

            <a 
              href="https://naufalarsyaputrapradana.github.io/other-project" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold text-center rounded-lg shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02]"
            >
              Lihat Proyek Lainnya
            </a>
          </div>
        </div>
      </div>

      {/* Large Center Promo Popup (Exit Intent) */}
      <div 
        className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-700 backdrop-blur-sm bg-black/60 p-4 ${
          showLarge ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className={`relative w-full max-w-2xl bg-[#0a0a0f] border border-blue-500/30 rounded-3xl p-8 md:p-12 shadow-2xl shadow-blue-900/50 overflow-hidden transition-transform duration-700 ${
            showLarge ? 'scale-100' : 'scale-95'
          }`}
        >
          {/* Glow background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-50 blur-3xl"></div>
          
          <button 
            onClick={handleCloseLarge} 
            className="absolute top-4 right-4 text-slate-400 hover:text-white z-10 transition-colors w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
          >
            <X size={20} />
          </button>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/40">
              <Rocket className="w-10 h-10 animate-bounce" />
            </div>
            
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Tunggu Sebentar!</h3>
            <p className="text-slate-300 text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
              Saya memiliki banyak proyek menarik lainnya yang mungkin bisa memberikan Anda inspirasi. Cek halaman karya saya selengkapnya!
            </p>
            
            <a 
              href="https://naufalarsyaputrapradana.github.io/other-project" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={handleCloseLarge}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
            >
              <span>Lihat Proyek Lainnya</span>
              <ArrowRight size={18} />
            </a>

            <p className="text-slate-500 text-xs mt-6">
              Popup ini akan tertutup otomatis dalam <span className="font-bold text-blue-400">{timeLeft}</span> detik
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
