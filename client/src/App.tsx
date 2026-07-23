import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useThemeStore } from './store/themeStore';
import AnimatedRoutes from './components/AnimatedRoutes';
import PromoPopups from './components/ui/PromoPopups';
import GoogleTranslate from './components/ui/GoogleTranslate';

function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <AnimatedRoutes />
      <PromoPopups />
      <GoogleTranslate />
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
