'use client';

import { useEffect, useState } from 'react';

interface PageLoaderProps {
  /** Optional project icon (emoji or image path) to display in the center icon badge */
  icon?: React.ReactNode;
  /** Optional project name shown below the icon */
  label?: string;
  /** Optional hint line shown below the label */
  hint?: string;
  /** Variant controls the overall chrome: 'dashboard' (dark branded) vs 'portal' (theme-aware) */
  variant?: 'dashboard' | 'portal';
}

/**
 * Full-viewport loading screen that inherits CSS custom-property theme colours
 * (--accent-primary, --background, --foreground) so it looks right in every
 * portal theme and in both dark / light modes.
 */
export default function PageLoader({
  icon = '/ls-image.png',
  label = 'Little Seeds Platform',
  hint = 'Fetching your workspace…',
  variant = 'dashboard',
}: PageLoaderProps) {
  const [dots, setDots] = useState(0);
  const [progress, setProgress] = useState(8);

  // Fake-progress bar that crawls to ~92 % and waits for real data
  useEffect(() => {
    let raf: number;
    let start: number | null = null;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      // Ease-out curve: fast at first, slows after ~60 %
      const target = Math.min(92, 8 + (elapsed / 3200) * 84);
      setProgress(prev => {
        if (prev < target) return Math.min(target, prev + 0.6);
        return prev;
      });
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Animated ellipsis
  useEffect(() => {
    const t = setInterval(() => setDots(d => (d + 1) % 4), 420);
    return () => clearInterval(t);
  }, []);

  const dotsStr = '.'.repeat(dots);

  return (
    <div
      className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-background text-foreground overflow-hidden select-none"
      aria-busy="true"
      aria-label="Loading"
    >
      {/* ── Ambient glow blobs ───────────────────────────────────── */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full opacity-20 blur-3xl animate-pulse"
        style={{ background: 'var(--accent-primary)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-48 -right-48 w-[480px] h-[480px] rounded-full opacity-10 blur-3xl animate-pulse"
        style={{ background: 'var(--accent-primary)', animationDelay: '1.2s' }}
      />

      {/* ── Grid overlay (subtle) ────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Center card ──────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-sm w-full">

        {/* Icon ring */}
        <div className="relative flex items-center justify-center">
          {/* Outer spinning ring (Play Store style progress) */}
          <div className="absolute w-24 h-24 animate-spin" style={{ animationDuration: '2.5s' }}>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
              {/* Background track (subtle) */}
              <circle
                cx="48" cy="48" r={46}
                fill="transparent"
                stroke="color-mix(in oklch, var(--accent-primary) 12%, transparent)"
                strokeWidth="2"
              />
              {/* Animated progress ring */}
              <circle
                cx="48" cy="48" r={46}
                fill="transparent"
                stroke="var(--accent-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={289.026}
                strokeDashoffset={289.026 - (progress / 100) * 289.026}
                className="transition-all duration-300 ease-out"
              />
            </svg>
          </div>

          {/* Icon badge */}
          <div
            className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl overflow-hidden"
            style={{
              background: 'color-mix(in oklch, var(--accent-primary) 15%, var(--card))',
              border: '1.5px solid color-mix(in oklch, var(--accent-primary) 30%, transparent)',
              boxShadow: '0 0 32px color-mix(in oklch, var(--accent-primary) 25%, transparent)',
            }}
          >
            {typeof icon === 'string' && (icon.startsWith('/') || icon.includes('.')) ? (
              <img src={icon} className="w-12 h-12 object-contain" alt="Logo" />
            ) : (
              icon
            )}
          </div>
        </div>

        {/* Branding */}
        <div className="text-center space-y-1.5">
          <p
            className="text-[9px] font-black uppercase tracking-[0.25em] opacity-50"
          >
            {variant === 'portal' ? 'Little Seeds Client Portal' : 'Little Seeds Platform'}
          </p>
          <h1
            className="text-xl font-black tracking-tight font-outfit uppercase"
            style={{ color: 'var(--foreground)' }}
          >
            {label}
          </h1>
          <p className="text-[11px] font-semibold opacity-50">
            {hint}
            <span className="inline-block w-6 text-left">{dotsStr}</span>
          </p>
        </div>



      </div>

      {/* ── Bottom wordmark ──────────────────────────────────────── */}
      <div className="absolute bottom-7 flex items-center gap-1.5 opacity-25">
        <div
          className="w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-black"
          style={{
            background: 'var(--accent-primary)',
            color: 'var(--accent-primary-foreground, #fff)',
          }}
        >
          V
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.2em]">
          Little Seeds Docs
        </span>
      </div>
    </div>
  );
}
