import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean; // Computed property equivalent for convenience
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      get isDark() {
        const theme = get().theme;
        if (theme === 'system') {
          // Hanya evaluasi di sisi klien (browser)
          if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
          }
          return false;
        }
        return theme === 'dark';
      },
    }),
    {
      name: 'fintrack-theme', // Key di localStorage
    }
  )
);
