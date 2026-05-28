'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { 
  LuArrowLeft as ArrowLeft, LuSave as Save, 
  LuClock as ClockIcon, LuTag as Tag,
  LuPrinter as Printer, LuCheck as Check, LuFileText as FileText, 
  LuInfo as Info, LuBookOpen as BookOpen, LuUser as User2, LuCalendar as Calendar, LuHash as Hash,
  LuX as X, LuCompass as Compass, LuShieldCheck as ShieldCheck, LuMenu as Menu,
  LuType as Type, LuEye as Eye, LuChevronRight as ChevronRight
} from 'react-icons/lu';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDocumentStore, Doc } from '@/store/useDocumentStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useAuthStore } from '@/store/useAuthStore';
import TipTapEditor from '@/components/features/editor/TipTapEditor';

import '@/components/features/editor/editor.css';
import { format } from 'date-fns';
import { cn, toSlug } from '@/lib/utils';

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
    <div className="w-72 shrink-0 border-r border-border bg-card flex flex-col h-full overflow-y-auto absolute md:relative z-50 inset-y-0 left-0 shadow-2xl md:shadow-none transition-all">
      <div className="flex items-center justify-between p-4 border-b border-border/20">
        <span className="text-sm font-bold flex items-center gap-2 text-foreground">
          <Info className="w-4 h-4 text-primary" /> Document Details
        </span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-5 flex-1 text-foreground/80">
        {/* Status */}
        <div className="space-y-2">
          <p className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-wider">Status</p>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s.value}
                onClick={() => onUpdate({ status: s.value })}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border',
                  doc.status === s.value
                    ? `${s.color} border-current/20 ring-1 ring-current/30`
                    : 'text-muted-foreground bg-accent/30 border-border/40 hover:border-primary/50'
                )}
              >{s.label}</button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <p className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-wider">Category</p>
          <div className="flex flex-wrap gap-1.5">
            {sections.length > 0 ? (
              sections.map(sec => (
                <button
                  key={sec.id}
                  onClick={() => onUpdate({ category: sec.id })}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all border',
                    doc.category === sec.id
                      ? 'text-primary bg-primary/10 border-primary/35'
                      : 'text-muted-foreground bg-accent/30 border-border/40 hover:border-primary/30'
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
                    'px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all border',
                    doc.category === cat
                      ? 'text-primary bg-primary/10 border-primary/35'
                      : 'text-muted-foreground bg-accent/30 border-border/40 hover:border-primary/30'
                  )}
                >{cat}</button>
              ))
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <p className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3 h-3" /> Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {doc.tags.map((tag: string) => (
              <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-accent/40 border border-border/40 rounded-md text-[10px] font-bold text-muted-foreground group">
                #{tag}
                <button
                  onClick={() => onUpdate({ tags: doc.tags.filter((t: string) => t !== tag) })}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-rose-500"
                ><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
            <TagInput onAdd={tag => onUpdate({ tags: [...doc.tags, tag] })} />
          </div>
        </div>

        {/* Emoji */}
        <div className="space-y-2">
          <p className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-wider">Emoji Icon</p>
          <div className="flex gap-1.5 flex-wrap">
            {['📄','📝','📘','💡','🌱','🏫','🔑','🔌','💪','⚡','📦','🛒','🌐','⚙️','💻','📱','🔒','🎨','📊','🔍','🛡️','🛠️','🚀','📁','📂','📎','📌','📋'].map(e => (
              <button
                key={e}
                onClick={() => onUpdate({ emoji: e })}
                className={cn(
                  'w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all',
                  doc.emoji === e ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-accent'
                )}
              >{e}</button>
            ))}
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-3 pt-2 border-t border-border/20">
          <p className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-wider">Document Details</p>
          {[
            { icon: FileText, label: 'Word count', value: `${doc.wordCount} words` },
            { icon: User2,    label: 'Author',     value: doc.authorName },
            { icon: Calendar, label: 'Created',    value: format(new Date(doc.createdAt), 'MMM d, yyyy') },
            { icon: ClockIcon,   label: 'Updated',    value: format(new Date(doc.updatedAt), 'MMM d, HH:mm') },
          ].map(row => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="flex items-center gap-2.5">
                <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-[11px] text-muted-foreground/90 flex-1">{row.label}</span>
                <span className="text-[11px] font-bold text-foreground">{row.value}</span>
              </div>
            );
          })}
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
    <button onClick={() => setEditing(true)} className="px-2 py-0.5 rounded-md border border-dashed border-border/40 text-[10px] text-muted-foreground hover:border-primary/50 hover:text-primary transition-all cursor-pointer">
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
      className="px-2 py-0.5 rounded-md border border-primary/40 bg-accent text-[10px] w-20 outline-none text-foreground font-semibold"
    />
  );
}

interface TableOfContentHeading {
  text: string;
  id: string;
  level: number;
}

export default function DocumentPage() {
  const { slug } = useParams() as { slug: string[] };
  const router = useRouter();
  const { documents, updateDocument, setActiveDoc } = useDocumentStore();
  const { projects } = useProjectStore();
  const { user } = useAuthStore();
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [showInfo, setShowInfo] = useState(true);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setShowInfo(false);
    }
  }, []);

  const [editorMode, setEditorMode] = useState<'rich' | 'markdown' | 'preview'>('rich');
  const [tocHeadings, setTocHeadings] = useState<TableOfContentHeading[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  const sectionSlug = slug?.length > 1 ? decodeURIComponent(slug[0]) : null;
  const docSlug = slug?.length > 1 ? decodeURIComponent(slug[1]) : (slug ? decodeURIComponent(slug[0]) : '');

  const doc = documents.find(d => {
    // If it perfectly matches by ID, then they used the old link format, handle gracefully
    if (d.id === docSlug) return true;
    
    // Otherwise look up by slug
    if (toSlug(d.title) !== docSlug) return false;
    if (sectionSlug) {
      const p = projects.find(proj => proj.id === d.projectId);
      if (!p) return false;
      const sectionLabel = p.sections?.find(s => s.id === d.category)?.label || d.category;
      return toSlug(sectionLabel) === sectionSlug;
    }
    return true;
  });

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

  const getProjectSections = (proj: any) => {
    if (proj.sections && proj.sections.length > 0) return proj.sections;
    return [
      { id: 'teacher', label: proj.sectionLabels?.teacher || 'Teachers Manuals' },
      { id: 'admin', label: proj.sectionLabels?.admin || 'Admin Portal Setup' },
      { id: 'student', label: proj.sectionLabels?.student || 'Student & Parent Guides' },
      { id: 'developer', label: proj.sectionLabels?.developer || 'Core Developer Specs' },
    ];
  };

  const projectSections = project ? getProjectSections(project) : [];

  const orderedDocs: any[] = [];
  if (project) {
    const projDocs = documents.filter(d => d.projectId === project.id && (isAdmin ? true : d.status === 'published'));

    projectSections.forEach((section: any) => {
      const role = section.id;
      const catDocs = projDocs.filter(d => d.category === role);
      const rootDocs = catDocs.filter(d => !d.parentId);

      const addDocsRecursively = (docId: string) => {
        const children = catDocs.filter(d => d.parentId === docId);
        children.forEach(c => {
          orderedDocs.push(c);
          addDocsRecursively(c.id);
        });
      };

      rootDocs.forEach(d => {
        orderedDocs.push(d);
        addDocsRecursively(d.id);
      });
    });
  }

  const currentIndex = doc ? orderedDocs.findIndex(d => d.id === doc.id) : -1;
  const prevDoc = currentIndex > 0 ? orderedDocs[currentIndex - 1] : null;
  const nextDoc = currentIndex !== -1 && currentIndex < orderedDocs.length - 1 ? orderedDocs[currentIndex + 1] : null;

  const getSectionLabel = (categoryId: string) => {
    const sec = projectSections.find((s: any) => s.id === categoryId);
    return sec ? sec.label : categoryId;
  };

  return (
    <div className="flex-1 w-full bg-background flex flex-col min-h-full font-inter text-foreground">
      
      {/* Guest Mode Alert Banner Removed for public users */}

      {/* Navigation Header */}
      <header className="min-h-14 h-auto py-2.5 sm:py-0 sm:h-14 border-b border-border bg-card/90 backdrop-blur-xl sticky top-0 z-40 px-3 sm:px-4 flex flex-nowrap overflow-x-auto [&::-webkit-scrollbar]:hidden items-center justify-between gap-4">
        
        {/* Left Side: Back & Title */}
        <div className="flex items-center gap-1 sm:gap-3 min-w-0 shrink-0 lg:flex-1">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-xl shrink-0 hover:bg-accent text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Button>
 
          <div className="flex items-center gap-2 min-w-0 max-w-lg">
            <span className="text-xl shrink-0 select-none">{doc.emoji || '📄'}</span>
            <input
              value={doc.title}
              onChange={handleTitleChange}
              disabled={isReadOnly}
              className={cn(
                "bg-transparent border-none focus:outline-none text-base font-bold p-0 w-full min-w-0 truncate text-foreground font-outfit",
                isReadOnly ? "cursor-default" : "focus:border-b focus:border-primary/50"
              )}
              placeholder="Untitled Document"
            />
          </div>
 
        </div>
 
        {/* Right Side: Action Panel */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0 justify-end w-full sm:w-auto">
          
          {/* Reader Access Verification Badge Removed for public users */}
 
          {/* Editor Mode Tabs (Edit / Markdown / Preview) - Only visible to writers (Admins) */}
          {!isReadOnly && (
            <div className="flex items-center gap-0.5 bg-muted border border-border p-0.5 rounded-xl shadow-inner">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditorMode('rich')}
                className={cn(
                  "h-7 lg:px-2.5 px-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                  editorMode === 'rich'
                    ? "bg-primary text-primary-foreground font-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                title="Rich Text"
              >
                <Type className="w-3.5 h-3.5 lg:hidden" />
                <span className="hidden lg:inline">Rich</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditorMode('markdown')}
                className={cn(
                  "h-7 lg:px-2.5 px-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                  editorMode === 'markdown'
                    ? "bg-primary text-primary-foreground font-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                title="Markdown"
              >
                <Hash className="w-3.5 h-3.5 lg:hidden" />
                <span className="hidden lg:inline">Markdown</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditorMode('preview')}
                className={cn(
                  "h-7 lg:px-2.5 px-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                  editorMode === 'preview'
                    ? "bg-primary text-primary-foreground font-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
                title="Preview"
              >
                <Eye className="w-3.5 h-3.5 lg:hidden" />
                <span className="hidden lg:inline">Preview</span>
              </Button>
            </div>
          )}
 
          {/* Info toggle */}
          {!isReadOnly && (
            <Button
              variant="ghost" size="icon"
              onClick={() => setShowInfo(!showInfo)}
              className={cn("h-8 w-8 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground", showInfo && "bg-primary/10 text-primary")}
              title="Show Details Panel"
            >
              <Info className="w-4 h-4" />
            </Button>
          )}
 
          {/* Save button (Only shown to writers) */}
          {!isReadOnly && (
            <Button
              onClick={handleSave}
              size="sm"
              className={cn(
                "h-8 rounded-xl gap-1 lg:gap-1.5 px-2.5 lg:px-3 text-[10px] font-bold uppercase tracking-wider transition-all",
                saved ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-primary text-primary-foreground hover:bg-primary/95"
              )}
              disabled={saving}
              title="Save Changes"
            >
              {saved ? (
                <><Check className="w-3.5 h-3.5" /> <span className="hidden lg:inline">Saved</span></>
              ) : saving ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> <span className="hidden lg:inline">Saving…</span></>
              ) : (
                <><Save className="w-3.5 h-3.5" /> <span className="hidden lg:inline">Save Changes</span></>
              )}
            </Button>
          )}
 

        </div>
      </header>
 
      {/* Main Core Body (Split layout: Left Info panel, Center Document, Right TOC) */}
      <div className="flex flex-1 overflow-hidden relative">
        
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
            
            {/* Read-Only Top Page Banner Removed for public users */}
 
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
            
            {/* Next / Previous Navigation */}
            {(prevDoc || nextDoc) && (
              <div className="pt-10 border-t border-border/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prevDoc ? (
                  <Link href={`/docs/${toSlug(getSectionLabel(prevDoc.category))}/${toSlug(prevDoc.title)}`} className="flex flex-col gap-1 p-4 rounded-2xl border border-border bg-card/50 hover:bg-accent hover:border-primary/50 transition-all text-left group">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Previous</span>
                    <span className="text-sm font-bold text-foreground flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:-translate-x-1 transition-transform shrink-0" />
                      <span className="truncate">{prevDoc.emoji || '📄'} {prevDoc.title}</span>
                    </span>
                  </Link>
                ) : <div />}
                
                {nextDoc ? (
                  <Link href={`/docs/${toSlug(getSectionLabel(nextDoc.category))}/${toSlug(nextDoc.title)}`} className="flex flex-col gap-1 p-4 rounded-2xl border border-border bg-card/50 hover:bg-accent hover:border-primary/50 transition-all text-right group">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Next</span>
                    <span className="text-sm font-bold text-foreground flex items-center justify-end gap-2">
                      <span className="truncate">{nextDoc.emoji || '📄'} {nextDoc.title}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
                    </span>
                  </Link>
                ) : <div />}
              </div>
            )}

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
