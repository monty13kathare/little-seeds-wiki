'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useProjectStore } from '@/store/useProjectStore';
import TipTapEditor from '@/components/features/editor/TipTapEditor';
import '@/components/features/editor/editor.css';
import { format } from 'date-fns';
import { LuClock as Clock, LuPrinter as Printer, LuBookOpen as BookOpen, LuChevronRight as ChevronRight } from 'react-icons/lu';
import { cn, toSlug } from '@/lib/utils';

interface TocHeading {
  text: string;
  id: string;
  level: number;
}

export default function ClientDocPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const docId = params.docId as string;
  const router = useRouter();
  
  const { documents, setActiveDoc } = useDocumentStore();
  const { projects } = useProjectStore();

  const project = projects.find(p => p.id === projectId || toSlug(p.name) === projectId);
  const resolvedProjectId = project?.id || projectId;
  const doc = documents.find(d => d.projectId === resolvedProjectId && (d.id === docId || toSlug(d.title) === docId));
  const [tocHeadings, setTocHeadings] = useState<TocHeading[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState('');

  useEffect(() => {
    if (doc) {
      setActiveDoc(doc.id);
      // Build ToC from doc content
      try {
        const parsed = JSON.parse(doc.content);
        const headings: TocHeading[] = [];
        const slugCounts: Record<string, number> = {};
        const extract = (node: any) => {
          if (node.type === 'heading') {
            const text = (node.content || []).map((c: any) => c.text || '').join('');
            const base = text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            const level = node.attrs?.level || 1;
            if (text.trim()) {
              let hid = base;
              if (slugCounts[base] !== undefined) { slugCounts[base]++; hid = `${base}-${slugCounts[base]}`; }
              else slugCounts[base] = 0;
              headings.push({ text, id: hid, level });
            }
          }
          (node.content || []).forEach(extract);
        };
        extract(parsed);
        setTocHeadings(headings);
      } catch { setTocHeadings([]); }
    }
  }, [doc, setActiveDoc]);

  // Redirect if doc not found or not published
  if (!doc || doc.status !== 'published') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="p-10 rounded-3xl bg-card border border-border flex flex-col items-center max-w-sm shadow-xl space-y-4">
          <BookOpen className="w-10 h-10 text-muted-foreground" />
          <div>
            <h2 className="text-base font-black text-foreground font-outfit">Document Not Available</h2>
            <p className="text-xs text-muted-foreground mt-1">This document may not be published yet.</p>
          </div>
          <button
            onClick={() => router.push(`/client/${projectId}`)}
            className="text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
          >
            ← Back to Module
          </button>
        </div>
      </div>
    );
  }

  const scrollToHeading = (heading: TocHeading, index: number) => {
    const container = document.getElementById('client-doc-area');
    if (!container) return;
    const elements = Array.from(container.querySelectorAll('h1, h2, h3, h4')).filter(el => el.textContent?.trim());
    const target = elements[index];
    if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); setActiveHeadingId(heading.id); }
  };

  // Find prev/next docs in same project (published only)
  const projectDocs = documents.filter(d => d.projectId === resolvedProjectId && d.status === 'published');
  const currentIndex = projectDocs.findIndex(d => d.id === docId || toSlug(d.title) === docId);
  const prevDoc = currentIndex > 0 ? projectDocs[currentIndex - 1] : null;
  const nextDoc = currentIndex < projectDocs.length - 1 ? projectDocs[currentIndex + 1] : null;

  return (
    <div className="flex flex-1 overflow-hidden">
      
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="w-full py-4 px-2 sm:py-6 sm:px-6 md:px-8 space-y-6">
          
          {/* Doc Header */}
          <div className="space-y-3 pb-6 border-b border-border/30">
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>{project?.name}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground">{doc.title}</span>
            </div>
            <div className="flex items-center gap-2 text-xl select-none">
              <span>{doc.emoji || '📄'}</span>
              <h1 className="text-2xl font-black text-foreground font-outfit tracking-tight">{doc.title}</h1>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-semibold">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {Math.ceil(doc.wordCount / 200) || 1} min read
              </span>
              <span>·</span>
              <span>Updated {format(new Date(doc.updatedAt), 'MMM d, yyyy')}</span>
              {doc.tags.length > 0 && (
                <>
                  <span>·</span>
                  {doc.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 bg-accent border border-border rounded text-[9px] font-bold uppercase tracking-wider">#{tag}</span>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Document Content */}
          <div id="client-doc-area">
            <TipTapEditor
              content={doc.content}
              editable={false}
              editorMode="preview"
            />
          </div>

          {/* Footer: Prev / Next navigation */}
          <div className="pt-8 border-t border-border/20 flex flex-col sm:flex-row gap-4 justify-between items-center pb-8">
            {prevDoc ? (
              <button
                onClick={() => router.push(`/client/${projectId}/docs/${toSlug(prevDoc.title)}`)}
                className="flex flex-col items-start p-3.5 px-5 rounded-xl border border-border hover:border-primary/40 hover:bg-accent/50 transition-all group max-w-xs w-full text-left"
              >
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">← Previous</span>
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate w-full">{prevDoc.title}</span>
              </button>
            ) : <div className="hidden sm:block" />}
            {nextDoc ? (
              <button
                onClick={() => router.push(`/client/${projectId}/docs/${toSlug(nextDoc.title)}`)}
                className="flex flex-col items-end p-3.5 px-5 rounded-xl border border-border hover:border-primary/40 hover:bg-accent/50 transition-all group max-w-xs w-full text-right"
              >
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Next →</span>
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate w-full">{nextDoc.title}</span>
              </button>
            ) : <div className="hidden sm:block" />}
          </div>
        </div>
      </div>

      {/* Right: Table of Contents */}
      {tocHeadings.length > 0 && (
        <aside className="hidden xl:block w-56 shrink-0 border-l border-border py-12 px-5 overflow-y-auto">
          <div className="space-y-4 sticky top-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">On this page</p>
            <nav className="space-y-2">
              {tocHeadings.map((h, idx) => (
                <button
                  key={h.id}
                  onClick={() => scrollToHeading(h, idx)}
                  className={cn(
                    "w-full text-left text-xs leading-relaxed transition-all block truncate",
                    h.level === 2 ? "pl-3 text-[11px]" : h.level >= 3 ? "pl-5 text-[10px]" : "pl-0",
                    activeHeadingId === h.id
                      ? "text-primary font-extrabold border-l-2 border-primary pl-2 -ml-px"
                      : "text-muted-foreground hover:text-foreground font-medium"
                  )}
                >
                  {h.text}
                </button>
              ))}
            </nav>
          </div>
        </aside>
      )}
    </div>
  );
}
