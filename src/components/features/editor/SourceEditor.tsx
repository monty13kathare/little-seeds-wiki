'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SourceEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
}

import { Split, Eye, Code2, Layers, Cpu, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SourceEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
}

export default function SourceEditor({ value, onChange, language = 'markdown' }: SourceEditorProps) {
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [isSplit, setIsSplit] = useState(true);
  const lineCount = content.split('\n').length;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    onChange(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textareaRef.current!.selectionStart;
      const end = textareaRef.current!.selectionEnd;
      const val = content.substring(0, start) + '  ' + content.substring(end);
      setContent(val);
      onChange(val);
      setTimeout(() => {
        textareaRef.current!.selectionStart = textareaRef.current!.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#0d1117] rounded-[32px] border border-white/5 overflow-hidden font-mono text-sm group shadow-3xl transition-all duration-500">
      {/* VS Code Style Header */}
      <div className="h-14 bg-[#161b22] flex items-center px-6 gap-6 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3 h-full border-b-2 border-primary px-4 text-primary font-black text-[11px] uppercase tracking-widest bg-primary/5">
          <Globe className="w-4 h-4" />
          {language}.md
        </div>
        
        <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/5 ml-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { setIsSplit(false); setShowPreview(false); }}
            className={cn("h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest gap-2", !isSplit && !showPreview ? "bg-primary text-white" : "text-slate-500")}
          >
            <Code2 className="w-3.5 h-3.5" /> Editor
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { setIsSplit(true); setShowPreview(true); }}
            className={cn("h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest gap-2", isSplit ? "bg-primary text-white" : "text-slate-500")}
          >
            <Split className="w-3.5 h-3.5" /> Split
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { setIsSplit(false); setShowPreview(true); }}
            className={cn("h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest gap-2", !isSplit && showPreview ? "bg-primary text-white" : "text-slate-500")}
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor Pane */}
        {(!showPreview || isSplit) && (
          <div className={cn("flex flex-1 overflow-hidden transition-all duration-500", isSplit ? "border-r border-white/5" : "w-full")}>
            {/* Line Numbers */}
            <div className="w-14 bg-[#0d1117] pt-6 flex flex-col items-end pr-4 select-none text-slate-700 font-bold text-[10px]">
              {Array.from({ length: Math.max(lineCount, 30) }).map((_, i) => (
                <div key={i} className="h-6 leading-6">{i + 1}</div>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="flex-1 w-full bg-transparent p-6 outline-none text-slate-300 resize-none leading-6 placeholder:text-slate-800 scrollbar-none"
              placeholder="# Enter Markdown content here..."
              spellCheck={false}
            />
          </div>
        )}

        {/* Preview Pane */}
        {showPreview && (
          <div className={cn("flex-1 overflow-y-auto bg-[#0d1117] p-10 scrollbar-none transition-all duration-500", isSplit ? "bg-black/20" : "w-full")}>
            <div className="max-w-3xl mx-auto prose prose-invert prose-emerald">
              {content ? (
                <div className="space-y-6">
                  {/* Pseudo-Markdown Previewer */}
                  {content.split('\n').map((line, i) => {
                    const formatText = (text: string) => {
                      let formatted = text;
                      // Bold
                      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                      // Italic
                      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
                      // Inline Code
                      formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono text-[0.9em]">$1</code>');
                      return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
                    };

                    if (line.startsWith('# ')) return <h1 key={i} className="text-4xl font-black text-white tracking-tight border-b border-white/10 pb-4 mb-8">{formatText(line.replace('# ', ''))}</h1>;
                    if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-slate-100 mt-10 mb-4">{formatText(line.replace('## ', ''))}</h2>;
                    if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold text-slate-200 mt-8 mb-3">{formatText(line.replace('### ', ''))}</h3>;
                    if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-primary bg-primary/5 p-4 rounded-r-xl italic text-slate-400">{formatText(line.replace('> ', ''))}</blockquote>;
                    if (line.startsWith('- ')) return <li key={i} className="text-slate-300 ml-4 list-disc marker:text-primary mb-1">{formatText(line.replace('- ', ''))}</li>;
                    if (line === '---') return <hr key={i} className="border-white/10 my-8" />;
                    return <p key={i} className="text-slate-400 leading-relaxed min-h-6 mb-2">{formatText(line)}</p>;
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-4 opacity-50">
                  <Layers className="w-16 h-16 animate-pulse" />
                  <p className="font-bold uppercase tracking-widest text-xs">Waiting for content...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* VS Code Style Status Bar */}
      <div className="h-7 bg-primary flex items-center px-4 justify-between text-[10px] font-black text-primary-foreground uppercase tracking-tighter">
        <div className="flex gap-6 items-center">
          <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3" /> System Hub</span>
          <span className="flex items-center gap-1.5 opacity-80">UTF-8</span>
        </div>
        <div className="flex gap-6 items-center">
          <span className="bg-white/20 px-2 py-0.5 rounded">Markdown</span>
          <span>Ln {content.substring(0, textareaRef.current?.selectionStart || 0).split('\n').length}, Col {textareaRef.current?.selectionStart || 0}</span>
        </div>
      </div>
    </div>
  );
}
