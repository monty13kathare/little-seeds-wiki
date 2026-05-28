'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  Users, 
  Hash, 
  Link as LinkIcon, 
  MessageCircle, 
  Send,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  docTitle: string;
}

export default function ShareModal({ isOpen, onClose, docTitle }: ShareModalProps) {
  const [copied, setCopied] = React.useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialPlatforms = [
    { name: 'WhatsApp', icon: MessageCircle, color: 'bg-[#25D366]', url: `https://wa.me/?text=Check out this doc: ${docTitle} ${shareUrl}` },
    { name: 'Gmail', icon: Mail, color: 'bg-[#EA4335]', url: `mailto:?subject=${docTitle}&body=Check out this documentation: ${shareUrl}` },
    { name: 'LinkedIn', icon: Users, color: 'bg-[#0077B5]', url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}` },
    { name: 'Twitter', icon: Hash, color: 'bg-[#1DA1F2]', url: `https://twitter.com/intent/tweet?text=${docTitle}&url=${shareUrl}` },
    { name: 'Telegram', icon: Send, color: 'bg-[#0088CC]', url: `https://t.me/share/url?url=${shareUrl}&text=${docTitle}` },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-card border border-border shadow-3xl rounded-[32px] overflow-hidden p-8"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-accent rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 premium-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Share Document</h3>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{docTitle}</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Copy Link */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Document Link</label>
                <div className="flex gap-2 bg-accent/50 p-1.5 rounded-2xl border border-border">
                  <div className="flex-1 px-4 py-2 text-sm truncate text-muted-foreground font-mono">
                    {shareUrl}
                  </div>
                  <Button 
                    onClick={handleCopy}
                    size="sm"
                    className={cn(
                      "rounded-xl transition-all gap-2",
                      copied ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground"
                    )}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              {/* Social Grid */}
              <div className="grid grid-cols-5 gap-4">
                {socialPlatforms.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg",
                      platform.color
                    )}>
                      <platform.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-tighter">
                      {platform.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-border flex justify-center">
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                 <LinkIcon className="w-3 h-3" /> External sharing enabled
               </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
