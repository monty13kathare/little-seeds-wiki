'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Save, 
  Clock as ClockIcon, Tag,
  Printer, Check, FileText, 
  Info, BookOpen, User as User2, Calendar, Hash,
  X, Compass, ShieldCheck, Menu,
  Type, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDocumentStore, Doc } from '@/store/useDocumentStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useAuthStore } from '@/store/useAuthStore';
import TipTapEditor from '@/components/features/editor/TipTapEditor';

import '@/components/features/editor/editor.css';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS: Array<{ value: 'draft' | 'published' | 'archived'; label: string; color: string }> = [
  { value: 'draft',     label: 'Draft',     color: 'text-amber-500 bg-amber-500/10' },
  { value: 'published', label: 'Published', color: 'text-primary bg-primary/10' },
  { value: 'archived',  label: 'Archived',  color: 'text-muted-foreground bg-accent' },
];

function InfoPanel({ doc, onClose, onUpdate, sections = [] }: {
  doc: any;
  onClose: () => void;
  onUpdate: (updates: any) => void;
  sections?: any[];
}) {
  return (
    <div className="w-72 shrink-0 border-r border-border/50 bg-card/95 backdrop-blur-md flex flex-col h-full overflow-y-auto absolute md:relative z-50 inset-y-0 left-0 shadow-2xl md:shadow-none transition-all duration-300">
      <div className="flex items-center justify-between p-4 border-b border-border/40">
        <span className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-foreground">
          <Info className="w-3.5 h-3.5 text-primary" /> Document Details
        </span>
        <button 
          onClick={onClose} 
          className="text-muted-foreground hover:text-foreground p-1 hover:bg-accent rounded-lg transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-6 flex-1 text-foreground/80">
        {/* Status */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest">Status</p>
          <div className="grid grid-cols-3 gap-1.5">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s.value}
                onClick={() => onUpdate({ status: s.value })}
                className={cn(
                  'py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border text-center cursor-pointer',
                  doc.status === s.value
                    ? `${s.color} border-current/25 shadow-xs font-black`
                    : 'text-muted-foreground/80 bg-accent/30 border-border/40 hover:bg-accent hover:text-foreground'
                )}
              >{s.label}</button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest">Category</p>
          <div className="flex flex-wrap gap-1.5">
            {sections.length > 0 ? (
              sections.map(sec => (
                <button
                  key={sec.id}
                  onClick={() => onUpdate({ category: sec.id })}
                  className={cn(
                    'px-2.5 py-1.5 rounded-xl text-[10px] font-bold capitalize tracking-wider transition-all border cursor-pointer',
                    doc.category === sec.id
                      ? 'text-primary bg-primary/10 border-primary/30 font-black shadow-xs'
                      : 'text-muted-foreground/80 bg-accent/30 border-border/40 hover:bg-accent hover:text-foreground'
                  )}
                >
                  {sec.label}
                </button>
              ))
            ) : (
              (['teacher', 'developer', 'admin', 'student'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => onUpdate({ category: cat })}
                  className={cn(
                    'px-2.5 py-1.5 rounded-xl text-[10px] font-bold capitalize tracking-wider transition-all border cursor-pointer',
                    doc.category === cat
                      ? 'text-primary bg-primary/10 border-primary/30 font-black shadow-xs'
                      : 'text-muted-foreground/80 bg-accent/30 border-border/40 hover:bg-accent hover:text-foreground'
                  )}
                >{cat}</button>
              ))
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {doc.tags.map((tag: string) => (
              <span key={tag} className="flex items-center gap-1 px-2.5 py-1 bg-accent/50 border border-border/60 rounded-lg text-[10px] font-semibold text-muted-foreground group transition-all">
                #{tag}
                <button
                  onClick={() => onUpdate({ tags: doc.tags.filter((t: string) => t !== tag) })}
                  className="opacity-60 group-hover:opacity-100 transition-opacity hover:text-rose-500 cursor-pointer"
                ><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
            <TagInput onAdd={tag => onUpdate({ tags: [...doc.tags, tag] })} />
          </div>
        </div>

        {/* Emoji */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest">Emoji Icon</p>
          <div className="grid grid-cols-7 gap-1 p-1.5 bg-accent/30 border border-border/30 rounded-xl max-h-[160px] overflow-y-auto scrollbar-thin">
            {['📄','📝','📘','💡','🌱','🏫','🔑','🔌','💪','⚡','📦','🛒','🌐','⚙️','💻','📱','🔒','🎨','📊','🔍','🛡️','🛠️','🚀','📁','📂','📎','📌','📋'].map(e => (
              <button
                key={e}
                onClick={() => onUpdate({ emoji: e })}
                className={cn(
                  'w-7 h-7 rounded-lg text-base flex items-center justify-center transition-all cursor-pointer hover:scale-110',
                  doc.emoji === e ? 'bg-primary/20 ring-1 ring-primary/40' : 'hover:bg-accent'
                )}
              >{e}</button>
            ))}
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-3 pt-4 border-t border-border/30">
          <p className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-widest">Metadata</p>
          <div className="space-y-2 bg-accent/10 border border-border/20 p-3 rounded-xl">
            {[
              { icon: FileText, label: 'Word count', value: `${doc.wordCount} words` },
              { icon: User2,    label: 'Author',     value: doc.authorName },
              { icon: Calendar, label: 'Created',    value: format(new Date(doc.createdAt), 'MMM d, yyyy') },
              { icon: ClockIcon,   label: 'Updated',    value: format(new Date(doc.updatedAt), 'MMM d, HH:mm') },
            ].map(row => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-center justify-between gap-2.5">
                  <span className="text-[10px] text-muted-foreground/90 flex items-center gap-1.5 shrink-0">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground/70" />
                    {row.label}
                  </span>
                  <span className="text-[10px] font-bold text-foreground truncate max-w-[150px]">{row.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TagInput({ onAdd }: { onAdd: (tag: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  const commit = () => {
    const t = val.trim().toLowerCase().replace(/\s+/g, '-');
    if (t) onAdd(t);
    setVal('');
    setEditing(false);
  };

  if (!editing) return (
    <button onClick={() => setEditing(true)} className="px-2 py-1 rounded-lg border border-dashed border-border/40 text-[10px] text-muted-foreground hover:border-primary/50 hover:text-primary transition-all cursor-pointer">
      + tag
    </button>
  );

  return (
    <input
      ref={ref}
      value={val}
      onChange={e => setVal(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(''); setEditing(false); } }}
      onBlur={commit}
      placeholder="tag..."
      className="px-2 py-1 rounded-lg border border-primary/40 bg-accent text-[10px] w-20 outline-none text-foreground font-semibold"
    />
  );
}

interface TableOfContentHeading {
  text: string;
  id: string;
  level: number;
}

export default function DocumentPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { documents, updateDocument, setActiveDoc } = useDocumentStore();
  const { user } = useAuthStore();
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [showInfo, setShowInfo] = useState(false);

  const [editorMode, setEditorMode] = useState<'rich' | 'markdown' | 'preview'>('rich');
  const [tocHeadings, setTocHeadings] = useState<TableOfContentHeading[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  const doc = documents.find(d => d.id === id);
  const { projects } = useProjectStore();
  const project = projects.find(p => p.id === doc?.projectId);
  const sections = project?.sections || [];

  // Lock Client Viewers strictly to Read-Only mode (matches Next.js Docs exactly)
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'admin';
  const isReadOnly = !isAdmin;

  useEffect(() => {
    if (doc) {
      setActiveDoc(doc.id);
      
      // Parse headings from structured Tiptap JSON to construct Table of Contents (TOC)
      try {
        const parsed = JSON.parse(doc.content);
        const headingsList: TableOfContentHeading[] = [];
        const slugCounts: Record<string, number> = {};
        
        const extract = (node: any) => {
          if (node.type === 'heading') {
            const text = node.content ? node.content.map((c: any) => c.text || '').join('') : '';
            const baseHid = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            const level = node.attrs?.level || 1;
            if (text.trim()) {
              let hid = baseHid;
              if (slugCounts[baseHid] !== undefined) {
                slugCounts[baseHid]++;
                hid = `${baseHid}-${slugCounts[baseHid]}`;
              } else {
                slugCounts[baseHid] = 0;
              }
              headingsList.push({ text, id: hid, level });
            }
          }
          if (node.content && Array.isArray(node.content)) {
            node.content.forEach(extract);
          }
        };
        extract(parsed);
        setTocHeadings(headingsList);
      } catch (err) {
        setTocHeadings([]);
      }
    }
  }, [doc, setActiveDoc]);

  if (!doc || (isReadOnly && doc.status !== 'published')) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-background p-8 text-muted-foreground">
        <div className="p-12 rounded-2xl bg-card border border-border flex flex-col items-center max-w-md text-center shadow-2xl">
          <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2 text-foreground">Document Not Found</h2>
          <p className="text-sm text-muted-foreground/80 mb-6">This document might have been moved, deleted, or is restricted from your simulated client profile.</p>
          <Button onClick={() => router.push('/dashboard')} className="rounded-xl px-6 bg-primary text-primary-foreground font-bold">Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const handleContentChange = (newContent: string) => {
    updateDocument(doc.id, { content: newContent });
    setSaved(false);
  };

  const handleSave = () => {
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 600);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isReadOnly) {
      updateDocument(doc.id, { title: e.target.value });
    }
  };

  const scrollToHeading = (heading: TableOfContentHeading, index: number) => {
    const container = document.getElementById('document-content-area');
    if (!container) return;
    const elements = Array.from(container.querySelectorAll('h1, h2, h3, h4')).filter(el => el.textContent?.trim());
    const target = elements[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveHeadingId(heading.id);
    }
  };

  const handleDownloadPDF = () => {
    let bodyContent = '';
    try {
      const parsed = JSON.parse(doc.content);
      const toText = (node: any): string => {
        if (node.type === 'text') return node.text || '';
        if (node.content) return node.content.map(toText).join('');
        return '';
      };
      const toHtml = (node: any): string => {
        if (!node) return '';
        const inner = (node.content || []).map(toHtml).join('');
        switch (node.type) {
          case 'doc': return inner;
          case 'paragraph': return `<p>${inner || '&nbsp;'}</p>`;
          case 'heading': return `<h${node.attrs?.level || 1}>${inner}</h${node.attrs?.level || 1}>`;
          case 'bulletList': return `<ul>${inner}</ul>`;
          case 'orderedList': return `<ol>${inner}</ol>`;
          case 'listItem': return `<li>${inner}</li>`;
          case 'blockquote': return `<blockquote>${inner}</blockquote>`;
          case 'codeBlock': return `<pre><code>${toText(node)}</code></pre>`;
          case 'horizontalRule': return '<hr/>';
          case 'image':
            const src = node.attrs?.src || '';
            const alt = node.attrs?.alt || '';
            const title = node.attrs?.title || '';
            return `<img src="${src}" alt="${alt}" title="${title}" style="max-width: 100%; height: auto; display: block; margin: 12pt 0; border-radius: 4px;" />`;
          case 'table': return `<table style="width: 100%; border-collapse: collapse; margin: 12pt 0;">${inner}</table>`;
          case 'tableRow': return `<tr>${inner}</tr>`;
          case 'tableHeader': return `<th style="border: 1px solid #ccc; padding: 8pt; background: #f4f4f4; text-align: left;">${inner}</th>`;
          case 'tableCell': return `<td style="border: 1px solid #ccc; padding: 8pt;">${inner}</td>`;
          case 'text': {
            let t = node.text || '';
            (node.marks || []).forEach((m: any) => {
              if (m.type === 'bold') t = `<strong>${t}</strong>`;
              if (m.type === 'italic') t = `<em>${t}</em>`;
              if (m.type === 'underline') t = `<u>${t}</u>`;
              if (m.type === 'strike') t = `<s>${t}</s>`;
              if (m.type === 'code') t = `<code>${t}</code>`;
              if (m.type === 'link') t = `<a href="${m.attrs?.href || ''}" target="_blank" style="color: #3b82f6; text-decoration: underline;">${t}</a>`;
            });
            return t;
          }
          default: return inner;
        }
      };
      bodyContent = toHtml(parsed);
    } catch {
      bodyContent = `<p>${doc.content}</p>`;
    }

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
      <meta charset="utf-8">
      <title>${doc.title}</title>
      <style>
        @page { margin: 2cm; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 11pt; line-height: 1.8; color: #1f2937; max-width: 720px; margin: 0 auto; padding: 20px; }
        h1 { font-size: 24pt; margin-bottom: 6pt; border-bottom: 2px solid #e5e7eb; padding-bottom: 8pt; color: #111827; font-weight: 800; }
        h2 { font-size: 16pt; margin-top: 24pt; color: #1f2937; font-weight: 700; }
        h3 { font-size: 13pt; margin-top: 18pt; color: #374151; font-weight: 600; }
        p { margin: 8pt 0; color: #4b5563; }
        blockquote { border-left: 4px solid #10b981; margin: 12pt 0; padding: 8pt 16pt; color: #4b5563; bg: #f9fafb; font-style: italic; }
        pre { background: #f3f4f6; padding: 12pt; border-radius: 6pt; font-family: monospace; font-size: 9.5pt; white-space: pre-wrap; }
        code { background: #f3f4f6; padding: 1.5pt 4pt; border-radius: 3pt; font-family: monospace; }
        ul, ol { padding-left: 20pt; margin: 8pt 0; }
        li { margin: 4pt 0; color: #4b5563; }
        hr { border: none; border-top: 1px solid #e5e7eb; margin: 16pt 0; }
        .meta { font-size: 8.5pt; color: #9ca3af; margin-bottom: 24pt; border-bottom: 1px solid #f3f4f6; padding-bottom: 12pt; font-weight: 500; }
      </style>
    </head><body>
      <h1>${doc.title || 'Untitled'}</h1>
      <div class="meta">
        ${doc.authorName} &nbsp;·&nbsp; ${new Date(doc.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} &nbsp;·&nbsp; ${doc.wordCount} words
      </div>
      ${bodyContent}
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
          }, 100);
        };
      </script>
    </body></html>`);
    win.document.close();
  };

  const statusMeta = STATUS_OPTIONS.find(s => s.value === doc.status) || STATUS_OPTIONS[0];

  return (
    <div className="flex-1 w-full bg-background flex flex-col min-h-full font-inter text-foreground">
      
      {/* Guest Mode Alert Banner */}
      {!user && (
        <div className="bg-amber-500/5 border-b border-amber-500/10 px-6 py-2.5 flex items-center justify-between text-[11px] text-amber-500 font-bold select-none shrink-0">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-500" />
            <span>GUEST ACCESS: You are viewing this manual in read-only mode. Sign in as admin to create, edit, or delete documents.</span>
          </div>
          <Button 
            onClick={() => router.push('/login')}
            className="h-7 px-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-500 font-black rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer"
          >
            Admin Sign In
          </Button>
        </div>
      )}

      {/* Navigation Header */}
      <header className="min-h-16 h-auto py-3 sm:py-0 sm:h-16 border-b border-border bg-card/90 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 md:px-8 flex items-center justify-between gap-4">
        
        {/* Left Side: Back & Title */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9 rounded-xl shrink-0 hover:bg-accent text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Button>
 
          <div className="flex items-center gap-2.5 min-w-0 max-w-xs sm:max-w-md md:max-w-lg">
            <span className="text-2xl shrink-0 select-none">{doc.emoji || '📄'}</span>
            <input
              value={doc.title}
              onChange={handleTitleChange}
              disabled={isReadOnly}
              className={cn(
                "bg-transparent border-none focus:outline-none text-base sm:text-lg md:text-xl font-black p-0 w-full min-w-0 truncate text-foreground font-outfit",
                isReadOnly ? "cursor-default" : "hover:bg-accent/10 focus:bg-accent/25 px-2 py-1 rounded-lg -mx-2 transition-all"
              )}
              placeholder="Untitled Document"
            />
          </div>
 
          {/* Quick Info pill */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0 ml-2">
            <span className={cn('text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider leading-none', statusMeta.color)}>
              {statusMeta.label}
            </span>
            <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
              <ClockIcon className="w-3.5 h-3.5 text-muted-foreground/75" />
              {Math.ceil(doc.wordCount / 200) || 1} min
            </span>
            {doc.tags.slice(0, 1).map(tag => (
              <Badge key={tag} className="text-[9px] uppercase px-1.5 py-0 h-4 bg-accent border border-border text-muted-foreground font-bold">#{tag}</Badge>
            ))}
          </div>
        </div>
 
        {/* Right Side: Action Panel */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Reader Access Verification Badge */}
          {isReadOnly && (
            <div className="hidden lg:flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl text-[10px] font-bold text-primary select-none">
              <ShieldCheck className="w-4 h-4" /> {user ? 'Client View Access' : 'Guest View Access'}
            </div>
          )}
 
          {/* Editor Mode Tabs (Edit / Markdown / Preview) - Only visible to writers (Admins) */}
          {!isReadOnly && (
            <div className="flex items-center gap-1 bg-muted border border-border p-1 rounded-xl shadow-inner h-9">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditorMode('rich')}
                className={cn(
                  "h-7 px-2.5 sm:px-3.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                  editorMode === 'rich'
                    ? "bg-primary text-primary-foreground font-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                title="Rich Text"
              >
                <Type className="w-3.5 h-3.5 sm:hidden" />
                <span className="hidden sm:inline">Rich</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditorMode('markdown')}
                className={cn(
                  "h-7 px-2.5 sm:px-3.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                  editorMode === 'markdown'
                    ? "bg-primary text-primary-foreground font-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                title="Markdown"
              >
                <Hash className="w-3.5 h-3.5 sm:hidden" />
                <span className="hidden sm:inline">Markdown</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditorMode('preview')}
                className={cn(
                  "h-7 px-2.5 sm:px-3.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                  editorMode === 'preview'
                    ? "bg-primary text-primary-foreground font-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                title="Preview"
              >
                <Eye className="w-3.5 h-3.5 sm:hidden" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
            </div>
          )}
 
          {/* Info toggle */}
          {!isReadOnly && (
            <Button
              variant="ghost" size="icon"
              onClick={() => setShowInfo(!showInfo)}
              className={cn("h-9 w-9 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground shrink-0", showInfo && "bg-primary/10 text-primary")}
              title="Show Details Panel"
            >
              <Info className="w-4 h-4" />
            </Button>
          )}
 
          {/* Download PDF */}
          <Button
            variant="outline" size="sm"
            onClick={handleDownloadPDF}
            className="h-9 rounded-xl gap-1.5 px-3.5 sm:px-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-accent border-border hover:bg-accent/80 text-foreground transition-colors shrink-0"
            title="Download PDF"
          >
            <Printer className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">PDF</span>
          </Button>

          {/* Publish / Unpublish button (Only shown to writers) */}
          {!isReadOnly && (
            <Button
              onClick={async () => {
                const newStatus = doc.status === 'published' ? 'draft' : 'published';
                await updateDocument(doc.id, { status: newStatus });
              }}
              size="sm"
              className={cn(
                "h-9 rounded-xl gap-1.5 px-4 sm:px-4.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all shrink-0",
                doc.status === 'published'
                  ? "bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/20 text-amber-500"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              )}
              title={doc.status === 'published' ? "Unpublish Document" : "Publish Document"}
            >
              {doc.status === 'published' ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Unpublish</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Publish</span>
                </>
              )}
            </Button>
          )}
 
          {/* Save button (Only shown to writers) */}
          {!isReadOnly && (
            <Button
              onClick={handleSave}
              size="sm"
              className={cn(
                "h-9 rounded-xl gap-1.5 px-4 sm:px-4.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all shrink-0",
                saved ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-primary text-primary-foreground hover:bg-primary/95"
              )}
              disabled={saving}
              title="Save Changes"
            >
              {saved ? (
                <><Check className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Saved</span></>
              ) : saving ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> <span className="hidden sm:inline">Saving…</span></>
              ) : (
                <><Save className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Save</span></>
              )}
            </Button>
          )}
 

        </div>
      </header>
 
      {/* Main Core Body (Split layout: Left Info panel, Center Document, Right TOC) */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Mobile Backdrop for Details Panel */}
        {showInfo && !isReadOnly && (
          <div 
            className="fixed inset-0 bg-background/50 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setShowInfo(false)}
          />
        )}

        {/* Sidebar Info Panel */}
        {showInfo && !isReadOnly && (
          <InfoPanel
            doc={doc}
            onClose={() => setShowInfo(false)}
            onUpdate={(updates) => updateDocument(doc.id, updates)}
            sections={sections}
          />
        )}
 
        {/* Center Document Container */}
        <div className="flex-1 overflow-y-auto relative w-full scrollbar-thin">
          <div className="max-w-4xl mx-auto py-6 sm:py-12 px-4 sm:px-12 lg:px-16 space-y-8">
            
            {/* Read-Only Top Page Banner */}
            {isReadOnly && (
              <div className="p-4 bg-card border border-border rounded-2xl flex items-start gap-3 text-xs text-muted-foreground select-none">
                <Compass className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">Systematic Flow Guidelines</p>
                  <p className="mt-0.5 leading-relaxed">You are viewing the official client flow manual for <span className="font-bold text-foreground">{doc.title}</span>. Content is restricted to read-only access based on your simulated client profile.</p>
                </div>
              </div>
            )}
 
            {/* Document Core Content */}
            <div id="document-content-area" className={cn(
              "bg-transparent relative",
              isReadOnly ? "prose-viewer text-foreground" : ""
            )}>
              <TipTapEditor 
                content={doc.content} 
                editable={!isReadOnly} 
                onChange={handleContentChange} 
                editorMode={isReadOnly ? 'preview' : editorMode}
                setEditorMode={setEditorMode}
              />
            </div>
            
            {/* Bottom Footer */}
            <div className="pt-8 border-t border-border/20 flex items-center justify-center text-xs text-muted-foreground font-bold">
              <div className="flex items-center gap-1">
                <span>Made with ❤️ by</span>
                <span className="text-foreground hover:text-primary transition-colors font-black">Little Seeds</span>
              </div>
            </div>
 
          </div>
        </div>

        {/* Dynamic "On This Page" Right Sidebar Table of Contents (TOC) - Matches Next.js perfectly */}
        {tocHeadings.length > 0 && (
          <aside className="hidden xl:block w-64 shrink-0 border-l border-border bg-card/45 py-12 px-6 overflow-y-auto space-y-6">
            <div className="space-y-4">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground select-none">
                On this page
              </p>
              <nav className="space-y-2">
                {tocHeadings.map((heading, idx) => {
                  const active = activeHeadingId === heading.id;
                  return (
                    <button
                      key={heading.id}
                      onClick={() => scrollToHeading(heading, idx)}
                      className={cn(
                        "w-full text-left text-sm font-bold leading-relaxed transition-all cursor-pointer block truncate",
                        heading.level === 2 ? "pl-3 text-sm" : "pl-0",
                        active 
                          ? "text-primary font-extrabold border-l-2 border-primary pl-2 -ml-2" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {heading.text}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
        )}

      </div>


    </div>
  );
}
