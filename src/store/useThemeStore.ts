import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = string;
export type FontFamily = 'inter' | 'outfit' | 'roboto' | 'montserrat' | 'mono';
export type FontSize = 'sm' | 'base' | 'lg' | 'xl';

interface ThemeStore {
  mode: ThemeMode;
  accentColor: AccentColor;
  fontFamily: FontFamily;
  fontSize: FontSize;
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
  setFontFamily: (font: FontFamily) => void;
  setFontSize: (size: FontSize) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'light',
      accentColor: '#507c74',
      fontFamily: 'inter',
      fontSize: 'base',
      setMode: (mode) => set({ mode }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    {
      name: 'nexus-theme',
    }
  )
);
