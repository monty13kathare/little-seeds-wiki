'use client';

import { useThemeStore } from '@/store/useThemeStore';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const { mode, accentColor, fontFamily, fontSize } = useThemeStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // ⛔ Don't touch the DOM on client portal routes — the portal layout
    //    manages its own per-project theme via a separate useEffect.
    if (pathname?.startsWith('/client/')) return;

    const root = window.document.documentElement;
    
    // Apply Mode
    if (mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply Accent
    // Clean up legacy property from previous iterations
    root.style.removeProperty('--accent-foreground');
    
    if (accentColor.startsWith('#')) {
      root.removeAttribute('data-accent');
      root.style.setProperty('--accent-primary', accentColor);
      root.style.setProperty('--accent-primary-foreground', 'oklch(0.985 0 0)');
    } else {
      root.style.removeProperty('--accent-primary');
      root.style.removeProperty('--accent-primary-foreground');
      root.setAttribute('data-accent', accentColor);
    }

    // Apply Font Size
    const sizeMap: Record<string, string> = {
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
    };
    root.style.fontSize = sizeMap[fontSize] || '16px';

    // Apply Font Variable for Editor and other components
    const fontMap: Record<string, string> = {
      inter: 'var(--font-inter)',
      outfit: 'var(--font-outfit)',
      roboto: 'var(--font-roboto)',
      montserrat: 'var(--font-montserrat)',
      mono: 'var(--font-jetbrains)',
    };
    
    const primaryFont = `${fontMap[fontFamily] || 'var(--font-inter)'}, sans-serif`;
    root.style.setProperty('--font-primary', primaryFont);
    root.style.fontFamily = primaryFont;
    
    if (fontFamily === 'mono') {
      root.style.setProperty('--font-mono', 'var(--font-jetbrains), monospace');
    }

    // Apply Font Classes for Tailwind
    document.body.classList.remove('font-inter', 'font-outfit', 'font-roboto', 'font-montserrat', 'font-mono');
    document.body.classList.add(`font-${fontFamily}`);
    
  }, [mode, accentColor, fontFamily, fontSize, mounted, pathname]);

  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
