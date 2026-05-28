'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import ThemeProvider from './ThemeProvider';

// Silence browser-extension-induced hydration mismatch warnings in the console (e.g. from Bitdefender, Buster, etc. injecting attributes like bis_skin_checked, bis_register, or __processed_)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const errorStr = args
      .map(arg => {
        try {
          if (typeof arg === 'string') return arg;
          if (typeof arg === 'object' && arg !== null) return JSON.stringify(arg);
          return String(arg);
        } catch (_) {
          return String(arg);
        }
      })
      .join(' ');

    if (
      errorStr.includes('bis_skin_checked') ||
      errorStr.includes('bis_register') ||
      errorStr.includes('__processed_')
    ) {
      return;
    }
    originalError(...args);
  };
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
