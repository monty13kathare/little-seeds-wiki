'use client';

import React, { useState } from 'react';
import { X, Image as ImageIcon, Link as LinkIcon, Upload, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'image' | 'link';
  onSubmit: (data: { url: string; text?: string }) => void;
  defaultValue?: string;
  defaultText?: string;
}

export default function EditorModal({ 
  isOpen, 
  onClose, 
  title, 
  type, 
  onSubmit, 
  defaultValue = '', 
  defaultText = '' 
}: EditorModalProps) {
  const [url, setUrl] = useState(defaultValue);
  const [text, setText] = useState(defaultText);
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>(type === 'image' ? 'upload' : 'url');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      onSubmit({ url, text });
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                {type === 'image' ? <ImageIcon className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Asset Manager</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {type === 'image' && (
            <div className="flex p-1 bg-accent/50 rounded-xl mb-6">
              <button 
                onClick={() => setActiveTab('upload')}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                  activeTab === 'upload' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Upload
              </button>
              <button 
                onClick={() => setActiveTab('url')}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                  activeTab === 'url' ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                URL
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'image' && activeTab === 'upload' ? (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 cursor-pointer overflow-hidden">
                {url && url.startsWith('data:') ? (
                  <img src={url} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Click to upload</span>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">URL</label>
                  <input 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                {type === 'link' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Label</label>
                    <input 
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Display text..."
                      className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-lg">Cancel</Button>
              <Button type="submit" disabled={!url} className="flex-1 rounded-lg">Insert</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
