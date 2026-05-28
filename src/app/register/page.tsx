'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, X } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const { register, isLoading, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const savedAuth = typeof window !== 'undefined' ? localStorage.getItem('nexus-auth') : null;
    let hasAuth = false;
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (parsed.state?.isAuthenticated && parsed.state?.user) {
          hasAuth = true;
        }
      } catch (e) {
        // ignore
      }
    }

    if (isAuthenticated || hasAuth) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    
    try {
      await register(name, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed';
      setToastMessage(msg);
      setTimeout(() => {
        setToastMessage(null);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#030712] font-inter text-slate-300">
      
      {/* Left panel (Little Seeds Branding & Value Pillars) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[50%] relative flex-col items-center justify-center p-16 overflow-hidden border-r border-border/20">
        <div className="absolute inset-0 bg-linear-to-br from-emerald-950/20 via-[#030712] to-[#030712]" />
        <div className="absolute top-[-15%] left-[-15%] w-[55%] h-[55%] bg-emerald-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-md text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/10 font-outfit font-black text-3xl text-emerald-400">
              V
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-wider text-slate-100 font-outfit uppercase">
              Join Little Seeds
            </h1>
            <p className="text-slate-400 text-xs font-bold leading-relaxed max-w-xs mx-auto">
              Create a free credentials account to read authorized manuals or author manual workspaces.
            </p>
          </div>

          {/* Quick Pillars */}
          <div className="grid grid-cols-1 gap-3 text-left">
            {[
              { emoji: '🛠️', title: 'Admin & Dev Creators', desc: 'Secure project workspace management for verified administrative team.' },
              { emoji: '👀', title: 'Simple Client Reader Accounts', desc: 'Easily log in and read authorized documentation assigned specifically to you.' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-4 p-4 rounded-2xl bg-[#0b1220]/60 border border-border/30 backdrop-blur-xs">
                <span className="text-xl shrink-0">{f.emoji}</span>
                <div>
                  <p className="text-[10px] font-black text-slate-200 uppercase tracking-wide">{f.title}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Little Seeds Portal Workspace v1.4</p>
        </div>
      </div>

      {/* Right panel (Interactive Register Form) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-8">
          
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-black text-slate-100 font-outfit uppercase tracking-wider">
              Create Account
            </h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Register a new access account to enter the workspace.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
              <div className={cn(
                'flex items-center gap-3 h-12 px-4 rounded-xl border bg-slate-950 transition-all',
                focused === 'name' ? 'border-emerald-500/50 ring-3 ring-emerald-500/10' : 'border-border/40'
              )}>
                <User className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  placeholder="Jane Doe"
                  className="flex-1 bg-transparent text-xs font-bold outline-none placeholder:text-slate-600 text-slate-100"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
              <div className={cn(
                'flex items-center gap-3 h-12 px-4 rounded-xl border bg-slate-950 transition-all',
                focused === 'email' ? 'border-emerald-500/50 ring-3 ring-emerald-500/10' : 'border-border/40'
              )}>
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="name@littleseeds.com"
                  className="flex-1 bg-transparent text-xs font-bold outline-none placeholder:text-slate-600 text-slate-100"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
              <div className={cn(
                'flex items-center gap-3 h-12 px-4 rounded-xl border bg-slate-950 transition-all',
                focused === 'password' ? 'border-emerald-500/50 ring-3 ring-emerald-500/10' : 'border-border/40'
              )}>
                <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  className="flex-1 bg-transparent text-xs font-bold outline-none placeholder:text-slate-600 text-slate-100"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-emerald-500 text-[#030712] font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-4 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#030712]/30 border-t-[#030712] rounded-full animate-spin" />
                  Creating Workspace Access…
                </>
              ) : (
                <>Register Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Footer Security & Sign In redirect */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Secure Cryptographic Access</span>
            </div>
            <p className="text-center text-xs font-bold text-slate-500 uppercase">
              Already registered?{' '}
              <Link href="/login" className="font-extrabold text-emerald-400 hover:underline">
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/30 backdrop-blur-md shadow-2xl max-w-sm"
          >
            <AlertCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="flex-1 text-xs font-bold text-emerald-100">
              {toastMessage}
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-400 hover:text-emerald-200 p-0.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
