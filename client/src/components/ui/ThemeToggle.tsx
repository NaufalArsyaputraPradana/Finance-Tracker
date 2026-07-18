import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const handleToggle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary shadow-sm flex items-center justify-center w-10 h-10 group"
      aria-label="Toggle Theme"
      title={`Tema saat ini: ${theme}`}
    >
      {theme === 'light' && <Sun className="w-5 h-5 text-amber-500 group-hover:rotate-90 transition-transform duration-500" />}
      {theme === 'dark' && <Moon className="w-5 h-5 text-blue-400 group-hover:-rotate-12 transition-transform duration-500" />}
      {theme === 'system' && <Monitor className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:scale-110 transition-transform duration-500" />}
    </button>
  );
}
