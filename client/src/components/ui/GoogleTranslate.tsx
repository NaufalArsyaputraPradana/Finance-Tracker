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
  }, []);

  const doGTranslate = (langPair: string) => {
    if (!langPair) return;
    const lang = langPair.split('|')[1];
    const selects = document.getElementsByTagName('select');
    for (let i = 0; i < selects.length; i++) {
      if (/goog-te-combo/.test(selects[i].className)) {
        selects[i].value = lang;
        selects[i].dispatchEvent(new Event('change'));
        break;
      }
    }
  };

  const toggleLanguage = () => {
    if (currentLang === 'id') {
      doGTranslate('id|en');
      setCurrentLang('en');
    } else {
      doGTranslate('en|id');
      setCurrentLang('id');
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
        <span className="text-xl leading-none">{currentLang === 'id' ? '🇮🇩' : '🇬🇧'}</span>
        <span>{currentLang === 'id' ? 'ID' : 'EN'}</span>
      </button>
    </div>
  );
}
