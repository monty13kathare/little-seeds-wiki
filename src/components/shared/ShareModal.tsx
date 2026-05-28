import { useState } from 'react';
import { X, Link2, Mail, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Project } from '@/store/useProjectStore';
import { cn, toSlug } from '@/lib/utils';

export default function ShareModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/${toSlug(project.name)}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmail = () => {
    window.open(`mailto:?subject=Check out this module: ${project.name}&body=Here is the public link to the module: ${publicUrl}`);
  };

  const handleWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=Check out this module: ${publicUrl}`);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out this module: ${project.name}`,
          url: publicUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors">
          <X className="w-4 h-4" />
        </button>
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style={{ backgroundColor: project.color + '20' }}>
              {project.icon}
            </div>
            <h2 className="text-xl font-black font-outfit uppercase tracking-tight">Share {project.name}</h2>
            <p className="text-xs text-muted-foreground mt-1 font-semibold">Anyone with the link can view this module publicly.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-accent/50 p-2 rounded-xl border border-border">
            <Input readOnly value={publicUrl} className="bg-transparent border-none focus-visible:ring-0 text-xs font-mono text-muted-foreground" />
            <Button onClick={handleCopy} size="sm" variant={copied ? 'default' : 'secondary'} className={cn("shrink-0 font-bold uppercase tracking-wider text-[10px]", copied && "bg-primary text-primary-foreground")}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border/50">
            <button onClick={handleCopy} className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Link2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Copy</span>
            </button>
            <button onClick={handleEmail} className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Email</span>
            </button>
            <button onClick={handleWhatsApp} className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Chat</span>
            </button>
            <button onClick={handleNativeShare} className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
