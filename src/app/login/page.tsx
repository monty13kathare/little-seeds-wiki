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
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 font-inter text-foreground overflow-y-auto">
      
      {/* Animated Background Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: 'linear-gradient(to bottom right, var(--accent-primary), transparent)', opacity: 0.1 }}></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: 'linear-gradient(to top right, var(--accent-primary), transparent)', opacity: 0.05, animationDelay: '2s' }}></div>
      </div>

      {/* Main Container */}
      <div className="relative w-full min-h-screen flex flex-col lg:flex-row items-center justify-center lg:gap-0">
        
        {/* Left Panel - Branding (Desktop Only) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex lg:w-1/2 h-screen flex-col items-center justify-center px-8 xl:px-16 relative"
        >
          {/* Decorative gradient background */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom right, var(--accent-primary), transparent)', opacity: 0.05 }}></div>
          
          <div className="relative z-10 max-w-lg text-center space-y-12">
            {/* Large Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-[4rem] blur-3xl" style={{ background: 'linear-gradient(to bottom right, var(--accent-primary), transparent)', opacity: 0.2 }}></div>
                <div className="relative w-48 h-48 bg-gradient-to-br from-white to-slate-50 rounded-[3rem] flex items-center justify-center shadow-2xl border-2 p-6 overflow-hidden" style={{ borderColor: 'var(--accent-primary)', borderOpacity: 0.1 }}>
                  <img src="/ls-image.png" className="w-full h-full object-contain" alt="Little Seeds Logo" />
                </div>
              </div>
            </motion.div>

            {/* Branding Text */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent font-outfit" style={{ backgroundImage: 'linear-gradient(to right, var(--accent-primary), var(--accent-primary))' }}>
                Little Seeds
              </h1>
              <p className="text-sm md:text-base font-semibold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                Rooted in Faith
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-md mx-auto">
                Comprehensive documentation platform for all Little Seeds project users, teams, and administrators.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Login Form */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/2 h-auto lg:h-screen flex flex-col items-center justify-center p-6 sm:p-8 md:p-12"
        >
          <div className="w-full max-w-md space-y-8">
            
            {/* Mobile Logo - Only on Small Screens */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex lg:hidden flex-col items-center space-y-6 text-center mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl blur-2xl" style={{ background: 'linear-gradient(to bottom right, var(--accent-primary), transparent)', opacity: 0.2 }}></div>
                <div className="relative w-32 h-32 bg-gradient-to-br from-white to-slate-50 rounded-3xl flex items-center justify-center shadow-xl border-2 p-4 overflow-hidden" style={{ borderColor: 'var(--accent-primary)', borderOpacity: 0.1 }}>
                  <img src="/ls-image.png" className="w-full h-full object-contain" alt="Little Seeds Logo" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold bg-clip-text text-transparent font-outfit" style={{ backgroundImage: 'linear-gradient(to right, var(--accent-primary), var(--accent-primary))' }}>
                  Little Seeds
                </h1>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rooted in Faith</p>
              </div>
            </motion.div>

            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="space-y-2 text-center lg:text-left"
            >
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground font-outfit">
                Welcome Back
              </h2>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">Enter your credentials to access your workspace.</p>
            </motion.div>

            {/* Login Form */}
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              onSubmit={handleLoginSubmit} 
              className="space-y-5"
            >
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Email Address</label>
                <div className={cn(
                  'flex items-center gap-3 h-12 md:h-14 px-4 md:px-5 rounded-2xl border-2 bg-white dark:bg-slate-900 transition-all duration-300 group',
                  focused === 'email' 
                    ? 'shadow-lg' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                )}
                style={{
                  borderColor: focused === 'email' ? 'var(--accent-primary)' : undefined,
                  boxShadow: focused === 'email' ? `0 10px 15px -3px var(--accent-primary, #507c74) / 0.2` : undefined
                }}>
                  <Mail className={cn(
                    'w-5 h-5 shrink-0 transition-colors duration-300'
                  )}
                  style={{ color: focused === 'email' ? 'var(--accent-primary)' : '#9ca3af' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    placeholder="name@littleseeds.com"
                    className="flex-1 bg-transparent text-sm md:text-base font-medium outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 text-foreground"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Password</label>
                <div className={cn(
                  'flex items-center gap-3 h-12 md:h-14 px-4 md:px-5 rounded-2xl border-2 bg-white dark:bg-slate-900 transition-all duration-300 group',
                  focused === 'password' 
                    ? 'shadow-lg' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                )}
                style={{
                  borderColor: focused === 'password' ? 'var(--accent-primary)' : undefined,
                  boxShadow: focused === 'password' ? `0 10px 15px -3px var(--accent-primary, #507c74) / 0.2` : undefined
                }}>
                  <Lock className={cn(
                    'w-5 h-5 shrink-0 transition-colors duration-300'
                  )}
                  style={{ color: focused === 'password' ? 'var(--accent-primary)' : '#9ca3af' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    className="flex-1 bg-transparent text-sm md:text-base font-medium outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 text-foreground"
                  />
                  <motion.button 
                    type="button" 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPassword(!showPassword)} 
                    className={cn(
                      'p-2 rounded-lg transition-all duration-300'
                    )}
                    style={{
                      color: focused === 'password' ? 'var(--accent-primary)' : undefined,
                      backgroundColor: focused === 'password' ? 'var(--accent-primary, #507c74)' : 'transparent',
                      opacity: focused === 'password' ? 0.1 : 1
                    }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                </div>
              </div>

              {/* Sign In Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-12 md:h-14 text-white font-bold text-sm md:text-base uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2 cursor-pointer"
                style={{
                  background: 'var(--accent-primary, #507c74)',
                  boxShadow: '0 10px 15px -3px var(--accent-primary, #507c74) / 0.3'
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 20px 25px -5px var(--accent-primary, #507c74) / 0.4'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 10px 15px -3px var(--accent-primary, #507c74) / 0.3'; }}
              >
                {isLoading ? (
                  <>
                    <motion.span 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Authenticating…
                  </>
                ) : (
                  <>
                    Sign In
                    <motion.div whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 200 }}>
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Security Badge */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/50 dark:bg-slate-800/50"
            >
              <ShieldCheck className="w-4 h-4" style={{ color: 'var(--accent-primary, #507c74)' }} />
              <span className="text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400">Secure Cryptographic Access</span>
            </motion.div>

          </div>
        </motion.div>
      </div>

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 p-4 md:p-5 rounded-2xl bg-gradient-to-br from-rose-950/90 to-rose-900/80 border border-rose-500/30 backdrop-blur-md shadow-2xl max-w-sm"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
            <div className="flex-1 text-xs md:text-sm font-semibold text-rose-100">
              {toastMessage}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setToastMessage(null)}
              className="text-rose-400 hover:text-rose-200 p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
