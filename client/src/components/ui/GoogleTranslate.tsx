import React, { useEffect, useState } from 'react';

// Declare global to avoid TS errors
declare global {
  interface Window {
    googleTranslateElementInit2: () => void;
    google: any;
  }
}

export default function GoogleTranslate() {
  const [currentLang, setCurrentLang] = useState('id');

  const drawFlag = (canvasId: string, lang: string) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (lang === 'id') {
        ctx.fillStyle = '#CE1126';
        ctx.fillRect(0, 0, w, h/2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, h/2, w, h/2);
    } else {
        // UK Flag simplified
        ctx.fillStyle = '#012169';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = h * 0.2;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(w, h);
        ctx.moveTo(w, 0); ctx.lineTo(0, h);
        ctx.moveTo(0, h/2); ctx.lineTo(w, h/2);
        ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h);
        ctx.stroke();
        ctx.strokeStyle = '#C8102E';
        ctx.lineWidth = h * 0.1;
        ctx.beginPath();
        ctx.moveTo(0, h/2); ctx.lineTo(w, h/2);
        ctx.moveTo(w/2, 0); ctx.lineTo(w/2, h);
        ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(0, 0, w, h);
  };

  useEffect(() => {
    // Inject Google Translate script only once
    if (!document.getElementById('google-translate-script')) {
      window.googleTranslateElementInit2 = () => {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'id', autoDisplay: false },
          'google_translate_element2'
        );
      };

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit2';
      script.async = true;
      document.body.appendChild(script);
    }
    
    // Draw initial flag
    drawFlag('flagCanvasGlobal', 'id');
  }, []);

  const doGTranslate = (langPair: string) => {
    if (!langPair) return;
    const lang = langPair.split('|')[1];
    
    // Coba mencari elemen select Google Translate (bisa jadi belum selesai dirender)
    const checkAndTranslate = (attempts = 0) => {
      const selects = document.getElementsByTagName('select');
      let found = false;
      for (let i = 0; i < selects.length; i++) {
        if (/goog-te-combo/.test(selects[i].className)) {
          selects[i].value = lang;
          // Harus menggunakan event bubbles agar terbaca oleh listener internal Google
          selects[i].dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          found = true;
          break;
        }
      }
      
      // Jika belum ketemu, coba lagi hingga 5x (jeda 500ms)
      if (!found && attempts < 5) {
        setTimeout(() => checkAndTranslate(attempts + 1), 500);
      }
    };
    
    checkAndTranslate();
  };

  const toggleLanguage = () => {
    if (currentLang === 'id') {
      doGTranslate('id|en');
      setCurrentLang('en');
      drawFlag('flagCanvasGlobal', 'en');
    } else {
      doGTranslate('en|id');
      setCurrentLang('id');
      drawFlag('flagCanvasGlobal', 'id');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-2">
      {/* Hidden div required by Google Translate */}
      <div id="google_translate_element2" className="hidden"></div>
      
      {/* Floating Toggle Button */}
      <button 
        onClick={toggleLanguage}
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all text-sm font-bold text-gray-700 dark:text-gray-200"
        title="Ubah Bahasa / Translate"
      >
        <canvas id="flagCanvasGlobal" width="20" height="15" className="rounded-sm"></canvas>
        <span>{currentLang === 'id' ? 'ID' : 'EN'}</span>
      </button>
    </div>
  );
}
