import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isLoading = false,
  onConfirm,
  onClose
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" 
      onClick={onClose}
    >
      <div 
        className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200 text-left" 
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-full transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 animate-bounce">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black font-outfit uppercase tracking-tight text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground mt-2 font-semibold leading-relaxed max-w-sm">
              {message}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {cancelLabel}
            </Button>
            <Button 
              type="button" 
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-rose-600/10 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
