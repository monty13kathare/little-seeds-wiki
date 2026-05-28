'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, X } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { login, isLoading, isAuthenticated } = useAuthStore();
  const { setActiveProject } = useProjectStore();
  const { setActiveDoc, documents } = useDocumentStore();
  const router = useRouter();

  useEffect(() => {
    const savedAuth = typeof window !== 'undefined' ? localStorage.getItem('nexus-auth') : null;
    let hasAuth = false;
    let savedRole = '';
    let savedProjectId = '';
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (parsed.state?.isAuthenticated && parsed.state?.user) {
          hasAuth = true;
          savedRole = parsed.state.user.role;
          savedProjectId = parsed.state.user.assignedProjectId || '';
        }
      } catch (e) {
        // ignore
      }
    }

    if (isAuthenticated || hasAuth) {
      if (savedRole === 'CLIENT' && savedProjectId) {
        router.replace(`/client/${savedProjectId}`);
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await executeLoginFlow(email, password);
  };

  const executeLoginFlow = async (targetEmail: string, targetPassword: string) => {
    try {
      await login(targetEmail, targetPassword);

      // Get fresh user state after login
      const { user } = useAuthStore.getState();

      // CLIENT users → redirect to their assigned project portal
      if (user?.role === 'CLIENT' && user?.assignedProjectId) {
        router.push(`/client/${user.assignedProjectId}`);
        return;
      }

      // Admin/Staff users → go to admin dashboard
      const normalized = targetEmail.toLowerCase().trim();
      if (normalized.includes('admin') || normalized === 'john@example.com' || normalized === 'jane@example.com') {
        setActiveProject('p1');
        const firstDoc = documents.find(d => d.projectId === 'p1' && d.category === 'teacher');
        if (firstDoc) setActiveDoc(firstDoc.id);
      } else if (normalized.includes('teacher') || normalized === 'jenkins@littleseeds.com') {
        setActiveProject('p1');
        const firstDoc = documents.find(d => d.projectId === 'p1' && d.category === 'teacher');
        if (firstDoc) setActiveDoc(firstDoc.id);
      } else if (normalized.includes('parent') || normalized.includes('student') || normalized === 'davis@littleseeds.com') {
        setActiveProject('p1');
        const firstDoc = documents.find(d => d.projectId === 'p1' && d.category === 'student');
        if (firstDoc) setActiveDoc(firstDoc.id);
      } else if (normalized.includes('merchant') || normalized === 'marco@littleseeds.com') {
        setActiveProject('p3');
        const firstDoc = documents.find(d => d.projectId === 'p3' && (d.category === 'teacher' || d.category === 'admin'));
        if (firstDoc) setActiveDoc(firstDoc.id);
      } else {
        setActiveProject('p1');
        const firstDoc = documents.find(d => d.projectId === 'p1' && d.category === 'developer');
        if (firstDoc) setActiveDoc(firstDoc.id);
      }

      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Login failed';
      setToastMessage(msg);
      setTimeout(() => {
        setToastMessage(null);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-screen flex flex-col lg:flex-row bg-background font-inter text-muted-foreground overflow-y-auto lg:overflow-hidden">

      {/* Left panel (Little Seeds Branding & Value Pillars) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[50%] lg:h-full relative flex-col items-center justify-end pb-12 px-16 overflow-hidden border-r border-border/20 bg-background">
        {/* Top Solid Sage Green Block */}
        <div className="absolute top-0 inset-x-0 h-[40%] bg-[#619289] flex items-end justify-center">
          {/* Curvy white/card divider wave matching the mobile mockup */}
          <svg 
            viewBox="0 0 1440 200" 
            className="absolute bottom-0 w-full h-[100px] fill-background translate-y-px"
            preserveAspectRatio="none"
          >
            <path d="M0,96 C360,250 820,-30 1440,96 L1440,200 L0,200 Z"></path>
          </svg>
        </div>

        {/* Logo positioned mathematically on the exact wave line boundary */}
        <div 
          className="absolute top-[32%] left-1/2 z-10 flex justify-center"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center shadow-2xl border border-[#619289]/15 p-4.5 overflow-hidden transition-transform duration-300 hover:scale-105">
            <img src="/ls-image.png" className="w-full h-full object-contain" alt="Little Seeds Logo" />
          </div>
        </div>

        {/* Bottom content section (placed perfectly below the wave in the bottom half) */}
        <div className="relative z-10 max-w-md text-center space-y-6 w-full">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-wider text-foreground font-outfit uppercase">
              Little Seeds Portal
            </h1>
            <p className="text-muted-foreground text-xs font-bold leading-relaxed max-w-xs mx-auto">
              Systematic project documentation manuals for developers, admin teams, and client viewers.
            </p>
          </div>

          {/* Quick Pillars */}
          <div className="grid grid-cols-1 gap-2.5 text-left">
            {[
              { emoji: '🔑', title: 'Admin Documentation Manager', desc: 'Log in as Little Seeds Admin to easily create, edit, rename or delete document structures.' },
              { emoji: '📖', title: 'Client Project Portal', desc: 'Clients get dedicated access to their project docs with a clean, focused reading experience.' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-card border border-border/40 backdrop-blur-xs transition-colors duration-300 hover:border-[#619289]/30">
                <span className="text-lg shrink-0">{f.emoji}</span>
                <div>
                  <p className="text-[10px] font-black text-foreground uppercase tracking-wide">{f.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Little Seeds Portal Workspace v1.4</p>
        </div>
      </div>

      {/* Right panel (Interactive Auth Form) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-8">

          {/* Mobile view logo - only visible on small screens */}
          <div className="flex flex-col items-center lg:hidden space-y-4 text-center">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-[#619289]/10 p-3.5 overflow-hidden">
              <img src="/ls-image.png" className="w-full h-full object-contain" alt="Little Seeds Logo" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-foreground font-outfit uppercase tracking-wider">
                Little Seeds Portal
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rooted in Faith</p>
            </div>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-black text-foreground font-outfit uppercase tracking-wider">
              Portal Sign In
            </h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Enter your credentials to access your workspace.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Email Address</label>
              <div className={cn(
                'flex items-center gap-3 h-12 px-4 rounded-full border bg-background transition-all',
                focused === 'email' ? 'border-[#619289] ring-3 ring-[#619289]/10' : 'border-border/50'
              )}>
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="name@littleseeds.com"
                  className="flex-1 bg-transparent text-xs font-bold outline-none placeholder:text-muted-foreground/50 text-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Password</label>
              <div className={cn(
                'flex items-center gap-3 h-12 px-4 rounded-full border bg-background transition-all',
                focused === 'password' ? 'border-[#619289] ring-3 ring-[#619289]/10' : 'border-border/50'
              )}>
                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  className="flex-1 bg-transparent text-xs font-bold outline-none placeholder:text-muted-foreground/50 text-foreground"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-[#619289] transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#619289] text-white font-black text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2.5 shadow-lg shadow-[#619289]/10 hover:bg-[#507c74] transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-4 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating Session…
                </>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Footer Security & Registration option */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-[#619289]" />
              <span>Secure Cryptographic Access</span>
            </div>
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
            className="fixed top-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl bg-rose-950/80 border border-rose-500/30 backdrop-blur-md shadow-2xl max-w-sm"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div className="flex-1 text-xs font-bold text-rose-100">
              {toastMessage}
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-rose-400 hover:text-rose-200 p-0.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
