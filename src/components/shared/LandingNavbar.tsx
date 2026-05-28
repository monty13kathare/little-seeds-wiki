'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LuLayoutGrid as Layout } from 'react-icons/lu';

export default function LandingNavbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-100 px-6 py-6"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between bg-card/60 backdrop-blur-2xl border border-border rounded-[24px] shadow-2xl">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter leading-none">Little Seeds</span>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary">Enterprise</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-10 text-xs font-black uppercase tracking-widest text-muted-foreground">
          <Link href="#features" className="hover:text-primary transition-colors">Capabilities</Link>
          <Link href="#solutions" className="hover:text-primary transition-colors">Solutions</Link>
          <Link href="#pricing" className="hover:text-primary transition-colors">Access</Link>
          <Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-bold rounded-xl px-6 h-11">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button className="premium-gradient text-primary-foreground font-bold rounded-xl px-8 h-11 shadow-lg shadow-primary/10 border-0">
              Join Little Seeds
            </Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
