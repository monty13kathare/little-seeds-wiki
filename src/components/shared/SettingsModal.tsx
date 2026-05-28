'use client';

import React from 'react';
import { 
  LuX as X, LuMoon as Moon, LuSun as Sun, LuMonitor as Monitor, LuType as Type, LuPalette as Palette, LuCheck as Check, LuSlidersHorizontal as Sliders
} from 'react-icons/lu';
import { useThemeStore, ThemeMode, AccentColor, FontFamily, FontSize } from '@/store/useThemeStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { mode, accentColor, fontFamily, fontSize, setMode, setAccentColor, setFontFamily, setFontSize } = useThemeStore();

  if (!isOpen) return null;

  const themes: { id: ThemeMode; label: string; icon: any }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  const accents: { id: AccentColor; color: string }[] = [
    { id: 'blue', color: 'bg-blue-500' },
    { id: 'purple', color: 'bg-purple-500' },
    { id: 'green', color: 'bg-emerald-500' },
    { id: 'amber', color: 'bg-amber-500' },
    { id: 'rose', color: 'bg-rose-500' },
    { id: 'slate', color: 'bg-slate-500' },
    { id: 'orange', color: 'bg-orange-500' },
    { id: 'mint', color: 'bg-teal-400' },
    { id: 'crimson', color: 'bg-rose-800' },
  ];

  const fonts: { id: FontFamily; label: string }[] = [
    { id: 'inter', label: 'Inter (Modern)' },
    { id: 'outfit', label: 'Outfit (Geometric)' },
    { id: 'roboto', label: 'Roboto (Clean)' },
    { id: 'montserrat', label: 'Montserrat (Bold)' },
    { id: 'mono', label: 'Monospace' },
  ];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Preferences
            </h2>
            <p className="text-sm text-muted-foreground">Customize your workspace appearance</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-none">
          {/* Theme Mode */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 opacity-60">
              <Sun className="w-4 h-4" /> Appearance
            </label>
            <div className="grid grid-cols-3 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setMode(t.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                    mode === t.id 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border hover:bg-accent"
                  )}
                >
                  <t.icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 opacity-60">
              <Palette className="w-4 h-4" /> Accent Tone
            </label>
            <div className="flex flex-wrap gap-4">
              {accents.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAccentColor(a.id)}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    a.color,
                    accentColor === a.id ? "ring-4 ring-primary/20 scale-110" : "opacity-80 hover:opacity-100"
                  )}
                >
                  {accentColor === a.id && <Check className="w-5 h-5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 opacity-60">
              <Type className="w-4 h-4" /> Typography
            </label>
            <div className="grid grid-cols-1 gap-2">
              {fonts.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFontFamily(f.id)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left",
                    fontFamily === f.id 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border hover:bg-accent",
                    `font-${f.id}`
                  )}
                >
                  <span className="text-sm">{f.label}</span>
                  {fontFamily === f.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size (Global Text Scaling) */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 opacity-60">
              <Sliders className="w-4 h-4" /> Global Text Size
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'sm', label: 'Small', sizeLabel: '14px' },
                { id: 'base', label: 'Normal', sizeLabel: '16px' },
                { id: 'lg', label: 'Large', sizeLabel: '18px' },
                { id: 'xl', label: 'Extra Large', sizeLabel: '20px' }
              ] as { id: FontSize; label: string; sizeLabel: string }[]).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setFontSize(s.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all cursor-pointer text-center",
                    fontSize === s.id 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border hover:bg-accent"
                  )}
                >
                  <span className="text-xs font-bold">{s.label}</span>
                  <span className="text-[10px] opacity-60 font-semibold">{s.sizeLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-accent/30 border-t border-border flex justify-end">
          <Button onClick={onClose} className="rounded-lg px-8">Done</Button>
        </div>
      </div>
    </div>
  );
}
