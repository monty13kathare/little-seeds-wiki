'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  LuUser as User, 
  LuSettings as SettingsIcon, 
  LuShield as Shield, 
  LuCheck as Check, 
  LuSave as Save, 
  LuMoon as Moon, 
  LuSun as Sun, 
  LuLayoutGrid as Layout, 
  LuType as Type,
  LuCircleAlert as AlertCircle,
  LuX as X,
  LuKeyRound as KeyRound,
  LuLaptop as Laptop,
  LuArrowLeft as ArrowLeft,
  LuPalette as Palette,
  LuSlidersHorizontal as Sliders,
  LuStar as Star,
  LuFileText as FileText,
  LuMail as Mail,
  LuLink2 as Link2
} from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/store/useThemeStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useProjectStore } from '@/store/useProjectStore';
import { format } from 'date-fns';
import Link from 'next/link';

const ACCENT_COLOR_MAP: Record<string, string> = {
  blue: '#3b82f6',
  purple: '#a855f7',
  green: '#10b981',
  rose: '#f43f5e',
  amber: '#f59e0b',
  slate: '#64748b',
  cyan: '#06b6d4',
  orange: '#f97316',
  mint: '#2dd4bf',
  crimson: '#9f1239',
};

type Tab = 'profile' | 'preferences' | 'security' | 'favorites';

export default function SettingsPage() {
  const { user, updateProfile, updatePreferences, isLoading } = useAuthStore();
  const { setMode, setAccentColor, setFontFamily: setThemeFontFamily, setFontSize: setStoreFontSize } = useThemeStore();
  const { documents, toggleFavorite } = useDocumentStore();
  const { projects } = useProjectStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const router = useRouter();

  // Profile fields state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');

  // Preference fields state
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [sidebarLayout, setSidebarLayout] = useState<'default' | 'compact'>('default');
  const [fontFamily, setFontFamily] = useState<string>('inter');
  const [accentColor, setAccentColorState] = useState<string>('blue');
  const [fontSize, setFontSizeState] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Initialize state from authenticated user
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatar(user.avatar || '');

      if (user.preferences) {
        setTheme(user.preferences.theme || 'dark');
        setSidebarLayout(user.preferences.sidebarLayout || 'default');
        setFontFamily(user.preferences.fontFamily || 'inter');
        setAccentColorState(user.preferences.accentColor || 'blue');
        setFontSizeState((user.preferences.fontSize || 'base') as any);
      }
    }
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(name, email, avatar);
      showToast('Profile updated successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePreferences({ theme, sidebarLayout, fontFamily, accentColor, fontSize });
      
      // Instantly apply theme preferences globally to the application in real-time
      setMode(theme);
      setAccentColor(accentColor);
      setThemeFontFamily(fontFamily.toLowerCase() as any);
      setStoreFontSize(fontSize as any);

      showToast('Preferences updated successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to update preferences', 'error');
    }
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('All fields are required', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    // Simulation
    showToast('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 lg:px-8 space-y-8 text-foreground">
      
      {/* Back Button & Header */}
      <div className="space-y-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4.5 h-4.5 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight font-outfit uppercase">Account & Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your public identity, application preferences, and security access.</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-2">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
            { id: 'security', label: 'Security & Access', icon: Shield },
            { id: 'favorites', label: 'Favorite Manuals', icon: Star },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-left transition-all cursor-pointer border",
                  active 
                    ? "bg-primary/10 border-primary/25 text-primary" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/40"
                )}
              >
                <Icon className={cn("w-4 h-4", active ? "text-primary" : "text-muted-foreground")} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Container */}
        <div className="md:col-span-3">
          <div className="bg-card border border-border p-8 rounded-3xl shadow-xl min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.form
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleProfileSubmit}
                  className="space-y-6"
                >
                  <div className="space-y-1 border-b border-border pb-4">
                    <h2 className="text-xl font-bold font-outfit flex items-center gap-2">
                      <User className="w-5 h-5 text-primary" /> Personal Information
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                      Manage your identity and contact details.
                    </p>
                  </div>
                  
                  {/* Banner & Avatar section */}
                  <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                    <div className="h-24 w-full bg-linear-to-r from-primary/30 via-primary/10 to-transparent"></div>
                    <div className="px-6 pb-6 flex flex-col sm:flex-row items-start sm:items-end gap-6 relative">
                      <div className="w-24 h-24 rounded-full border-4 border-card overflow-hidden bg-accent shrink-0 -mt-12 shadow-lg relative z-10">
                        {avatar ? (
                          <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-outfit text-3xl font-black text-muted-foreground bg-accent">
                            {name ? name.charAt(0) : '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 w-full space-y-1.5 pt-2 sm:pt-0">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Avatar URL</label>
                        <div className="relative">
                          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                          <input
                            type="url"
                            value={avatar}
                            onChange={e => setAvatar(e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-background text-xs font-semibold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Jane Doe"
                          required
                          className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-background text-xs font-semibold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="name@littleseeds.com"
                          required
                          className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-background text-xs font-semibold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">System Role</label>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-extrabold uppercase tracking-wide">
                        {user?.role || 'CLIENT'}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic mt-1">Contact your master administrator to adjust access levels.</p>
                  </div>

                  <div className="pt-4 border-t border-border flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-primary/10"
                    >
                      <Save className="w-4 h-4" />
                      Save Profile
                    </button>
                  </div>
                </motion.form>
              )}

              {activeTab === 'preferences' && (
                <motion.form
                  key="preferences"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handlePreferencesSubmit}
                  className="space-y-6"
                >
                  <div className="space-y-1 border-b border-border pb-4 text-left">
                    <h2 className="text-xl font-bold font-outfit flex items-center gap-2">
                      <Palette className="w-5 h-5 text-primary" /> Personal Preferences
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                      Set the look & feel you see when you navigate the workspace.
                    </p>
                  </div>

                  {/* Theme customization */}
                  <div className="space-y-2 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Appearance Mode</p>
                    <div className="flex gap-3">
                      {(['dark', 'light', 'system'] as const).map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setTheme(m)}
                          className={cn(
                            'flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border text-xs font-bold transition-all cursor-pointer bg-card',
                            theme === m
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'border-border hover:bg-accent text-muted-foreground'
                          )}
                        >
                          {m === 'dark' ? <Moon className="w-4 h-4 shrink-0" /> : m === 'light' ? <Sun className="w-4 h-4 shrink-0" /> : <Laptop className="w-4 h-4 shrink-0" />}
                          <span className="hidden sm:inline">
                            {m === 'dark' ? 'Dark Mode' : m === 'light' ? 'Light Mode' : 'System Default'}
                          </span>
                          {theme === m && <Check className="w-3.5 h-3.5 shrink-0 hidden sm:block" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accent Color Selection */}
                  <div className="space-y-2 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accent Colour</p>
                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center bg-accent/10 border border-border p-4 rounded-2xl animate-in fade-in duration-200">
                      {/* Color Swatch & System Picker */}
                      <label className="flex items-center justify-center w-14 h-14 rounded-xl border border-border hover:border-primary/55 cursor-pointer relative transition-all group overflow-hidden bg-card shadow-sm shrink-0">
                        <input
                          type="color"
                          value={accentColor.startsWith('#') ? accentColor : (ACCENT_COLOR_MAP[accentColor] || '#6366f1')}
                          onChange={e => setAccentColorState(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <span 
                          className="w-8 h-8 rounded-lg shadow-inner transition-transform group-hover:scale-110 border border-black/10" 
                          style={{ 
                            backgroundColor: accentColor.startsWith('#') 
                              ? accentColor 
                              : (ACCENT_COLOR_MAP[accentColor] || '#6366f1') 
                          }} 
                        />
                      </label>

                      {/* Input Hex Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Custom hex value</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-muted-foreground/60 select-none">#</span>
                          <input
                            type="text"
                            value={(accentColor.startsWith('#') ? accentColor : (ACCENT_COLOR_MAP[accentColor] || '#6366f1')).replace('#', '')}
                            onChange={e => {
                              const val = e.target.value;
                              const cleanVal = val.replace(/[^a-fA-F0-9]/g, '');
                              if (cleanVal.length <= 6) {
                                setAccentColorState(`#${cleanVal}`);
                              }
                            }}
                            className="bg-transparent text-sm font-black text-foreground focus:outline-none w-full tracking-wider font-mono uppercase border-b border-border/80 focus:border-primary/50 py-0.5"
                            placeholder="FFFFFF"
                            maxLength={6}
                          />
                        </div>
                      </div>

                      {/* Add Color Action Button */}
                      <label className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-border hover:bg-accent text-xs font-bold transition-all cursor-pointer bg-card hover:border-primary/20 shrink-0 select-none relative">
                        <input
                          type="color"
                          value={accentColor.startsWith('#') ? accentColor : (ACCENT_COLOR_MAP[accentColor] || '#6366f1')}
                          onChange={e => setAccentColorState(e.target.value)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-0 h-0"
                        />
                        <Palette className="w-4 h-4 text-primary" />
                        <span>Add Color</span>
                      </label>
                    </div>
                  </div>



                  {/* Font Family */}
                  <div className="space-y-2 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5" /> Font Family
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                      {[
                        { value: 'inter',       label: 'Inter',       preview: 'Aa' },
                        { value: 'outfit',      label: 'Outfit',      preview: 'Aa' },
                        { value: 'roboto',      label: 'Roboto',      preview: 'Aa' },
                        { value: 'montserrat',  label: 'Montserrat',  preview: 'Aa' },
                        { value: 'mono',        label: 'Mono',        preview: 'Aa' },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFontFamily(opt.value)}
                          className={cn(
                            'px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-center relative hover:shadow-xs hover:border-primary/20 cursor-pointer bg-card',
                            fontFamily.toLowerCase() === opt.value
                              ? 'bg-primary/10 border-primary text-primary font-black'
                              : 'border-border hover:bg-accent text-muted-foreground'
                          )}
                          style={{ fontFamily: opt.value === 'mono' ? 'var(--font-jetbrains), monospace' : `var(--font-${opt.value})` }}
                        >
                          <span>{opt.label}</span>
                          <span className="block text-[9px] font-medium opacity-50 tracking-wider">Aa</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-2 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5" /> Font Size
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {([
                        { value: 'sm', label: 'Small', details: '14px' },
                        { value: 'base', label: 'Normal', details: '16px' },
                        { value: 'lg', label: 'Large', details: '18px' },
                        { value: 'xl', label: 'Extra', details: '20px' }
                      ] as const).map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFontSizeState(opt.value)}
                          className={cn(
                            'px-2 py-2 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center hover:shadow-xs hover:border-primary/20 cursor-pointer bg-card',
                            fontSize === opt.value
                              ? 'bg-primary/10 border-primary text-primary font-black'
                              : 'border-border hover:bg-accent text-muted-foreground'
                          )}
                        >
                          <span>{opt.label}</span>
                          <span className="text-[9px] font-normal opacity-65 mt-0.5">{opt.details}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live preview box */}
                  <div
                    className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-accent/5 relative overflow-hidden text-left"
                    data-accent={accentColor.startsWith('#') ? undefined : accentColor}
                    style={{ 
                      fontFamily: `var(--font-${fontFamily.toLowerCase()})`,
                      borderColor: accentColor.startsWith('#') ? accentColor + '50' : undefined
                    }}
                  >
                    <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                    <div 
                      className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm shrink-0', theme === 'dark' ? 'bg-slate-800 border border-slate-700/50' : 'bg-white border border-slate-200/50')}
                      style={{
                        color: accentColor.startsWith('#') ? accentColor : undefined,
                        backgroundColor: accentColor.startsWith('#') ? accentColor + '20' : undefined
                      }}
                    >
                      👤
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs font-black uppercase tracking-wider truncate', theme === 'dark' ? 'text-slate-100' : 'text-slate-900')}>Workspace Preference Preview</p>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide mt-0.5">
                        Mode: {theme === 'dark' ? '🌙 Dark' : theme === 'light' ? '☀️ Light' : '💻 System'} • Accent: {accentColor.startsWith('#') ? accentColor : (ACCENT_COLOR_MAP[accentColor] || accentColor)} • Font: {fontFamily} • Size: {fontSize || 'base'}
                      </p>
                    </div>
                    <div 
                      className="shrink-0 border rounded-md px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest"
                      style={{
                        color: accentColor.startsWith('#') ? accentColor : 'var(--primary)',
                        borderColor: accentColor.startsWith('#') ? accentColor + '30' : 'var(--primary-foreground)',
                        backgroundColor: accentColor.startsWith('#') ? accentColor + '10' : 'var(--primary)/10'
                      }}
                    >
                      Live Preview
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-primary/10"
                    >
                      <Save className="w-4 h-4" />
                      Save Preferences
                    </button>
                  </div>
                </motion.form>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  {/* Password change form */}
                  <form onSubmit={handleSecuritySubmit} className="space-y-6">
                    <h2 className="text-xl font-bold font-outfit border-b border-border pb-4">Security & Authorization</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={e => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 px-4 rounded-xl border border-border bg-background text-xs font-semibold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 px-4 rounded-xl border border-border bg-background text-xs font-semibold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Confirm Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 px-4 rounded-xl border border-border bg-background text-xs font-semibold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-6 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-primary/10"
                      >
                        <KeyRound className="w-4 h-4" />
                        Update Password
                      </button>
                    </div>
                  </form>

                  {/* Module Access Control */}
                  <div className="space-y-4 pt-6 border-t border-border text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                          <Shield className="w-4 h-4 text-primary" /> Module Access Control
                        </h3>
                        <p className="text-[10px] font-semibold text-muted-foreground mt-1">Manage public visibility and authentication requirements per workspace.</p>
                      </div>
                    </div>
                    <div className="border border-border rounded-2xl overflow-hidden bg-background divide-y divide-border/50 shadow-sm">
                      {projects.length > 0 ? projects.map((proj, idx) => (
                        <div key={proj.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-accent/20 transition-all gap-4 group">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 border border-border flex items-center justify-center shrink-0 text-xl group-hover:scale-105 transition-transform">
                              {proj.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{proj.name}</p>
                              <div className="flex items-center gap-2 mt-1 text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                                <span>{proj.category || 'Module'}</span>
                                <span>•</span>
                                <span className={idx === 0 ? "text-emerald-500" : "text-amber-500"}>
                                  {idx === 0 ? 'Public Access' : 'Authentication Required'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[10px] font-bold text-muted-foreground hidden sm:block">Public Link</span>
                            {/* Toggle Switch */}
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                defaultChecked={idx === 0} 
                                onChange={() => showToast(`${proj.name} visibility updated!`, 'success')} 
                              />
                              <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary border border-border"></div>
                            </label>
                          </div>
                        </div>
                      )) : (
                        <div className="p-8 text-center border-dashed border-border bg-accent/10">
                          <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-20" />
                          <p className="text-xs text-muted-foreground font-semibold">No active workspaces available.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'favorites' && (
                <motion.div
                  key="favorites"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6 text-left"
                >
                  <div className="space-y-1 border-b border-border pb-4">
                    <h2 className="text-xl font-bold font-outfit flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Favorite Manuals
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                      Your highly accessed and bookmarked manuals.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {documents.filter(d => d.isFavorite).length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {documents.filter(d => d.isFavorite).map(doc => {
                          const project = projects.find(p => p.id === doc.projectId);
                          return (
                            <Link 
                              key={doc.id} 
                              href={`/dashboard/documents/${doc.id}`}
                              className="block p-4 rounded-2xl border border-border bg-card hover:bg-accent/40 transition-all group"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-accent border border-border flex items-center justify-center text-lg shrink-0">
                                  {doc.emoji || '📄'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{doc.title}</h4>
                                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold mt-1 uppercase tracking-wider">
                                    {project && <span className="text-primary">{project.name}</span>}
                                    <span>•</span>
                                    <span>{doc.category}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span className="hidden sm:inline">{format(new Date(doc.updatedAt), 'MMM d, yyyy')}</span>
                                  </div>
                                </div>
                                <button 
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(doc.id); }}
                                  className="p-1.5 rounded-md hover:bg-amber-500/10 transition-colors shrink-0 z-20 cursor-pointer group-hover:scale-110"
                                  title="Remove from favorites"
                                >
                                  <Star className="w-4 h-4 text-amber-500 fill-amber-500 opacity-80 hover:opacity-100 transition-opacity" />
                                </button>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center border border-dashed border-border rounded-2xl bg-accent/10">
                        <Star className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-20" />
                        <p className="text-xs text-muted-foreground font-semibold">You haven't favorited any documents yet.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed top-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl backdrop-blur-md shadow-2xl max-w-sm border",
              toast.type === 'success' 
                ? "bg-primary/10 border-primary/30 text-primary" 
                : "bg-red-950/80 border-red-500/35 text-red-100"
            )}
          >
            {toast.type === 'success' ? (
              <Check className="w-5 h-5 text-primary shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <div className="flex-1 text-xs font-bold">
              {toast.message}
            </div>
            <button
              onClick={() => setToast(null)}
              className={cn(
                "p-0.5 rounded-lg transition-colors cursor-pointer shrink-0",
                toast.type === 'success' ? "text-primary hover:text-primary/80" : "text-red-400 hover:text-red-200"
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
