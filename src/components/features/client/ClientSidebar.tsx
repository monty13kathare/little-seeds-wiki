'use client';

import React from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useProjectStore, getProjectSections } from '@/store/useProjectStore';
import { cn, toSlug } from '@/lib/utils';
import { 
  GraduationCap, ShieldAlert, Backpack, Code2, Briefcase, Users2, BookOpen, X,
  ChevronDown, ChevronRight 
} from 'lucide-react';
import { useState } from 'react';

const ICON_MAP: Record<string, any> = {
  GraduationCap, ShieldAlert, Backpack, Code2, Briefcase, Users2, BookOpen,
};

interface ClientSidebarProps {
  projectId: string;
  onClose?: () => void;
}

export default function ClientSidebar({ projectId, onClose }: ClientSidebarProps) {
  const params = useParams();
  const activeDocId = params?.docId as string | undefined;
  const router = useRouter();
  const pathname = usePathname();

  const { documents } = useDocumentStore();
  const { projects } = useProjectStore();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const project = projects.find(p => p.id === projectId || toSlug(p.name) === projectId);
  const sections = project ? getProjectSections(project) : [];
  const resolvedProjectId = project?.id || projectId;
  
  // Only published docs for this project
  const projectDocs = documents.filter(d => d.projectId === resolvedProjectId && d.status === 'published');

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const navigate = (doc: any) => {
    const basePath = pathname?.startsWith('/client') ? '/client' : '';
    router.push(`${basePath}/${projectId}/docs/${toSlug(doc.title)}`);
    onClose?.();
  };

  return (
    <div className="w-72 h-full bg-sidebar border-r border-sidebar-border flex flex-col text-sidebar-foreground select-none">
      
      {/* Project Header */}
      <div className="px-5 py-4 border-b border-border/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0">{project?.icon || '📂'}</span>
          <div className="min-w-0">
            <p className="text-xs font-black text-foreground font-outfit uppercase tracking-wider truncate">{project?.name}</p>
            <p className="text-[9px] text-primary font-bold uppercase tracking-widest leading-none mt-0.5 truncate">
              {project?.category || 'Documentation'}
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all shrink-0">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
        
        {/* Module overview link */}
        <div className="px-2 mb-3">
          <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">Module Overview</p>
        </div>

        {sections.length === 0 ? (
          // No sections — show all docs flat
          <div className="space-y-0.5">
            {projectDocs.map(doc => (
              <DocItem
                key={doc.id}
                doc={doc}
                active={doc.id === activeDocId || toSlug(doc.title) === activeDocId}
                onClick={() => navigate(doc)}
              />
            ))}
          </div>
        ) : (
          // Sections → group docs
          sections.map(section => {
            const Icon = ICON_MAP[section.icon || ''] || BookOpen;
            const sectionDocs = projectDocs.filter(d => d.category === section.id);
            const collapsed = collapsedSections[section.id] ?? false;

            return (
              <div key={section.id} className="space-y-0.5 mb-3">
                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors hover:bg-sidebar-accent group"
                >
                  {collapsed
                    ? <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                    : <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                  }
                  <Icon className="w-3.5 h-3.5 shrink-0 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    {section.label}
                  </span>
                  {sectionDocs.length > 0 && (
                    <span className="ml-auto text-[8px] font-black text-muted-foreground/50 bg-accent px-1.5 py-0.5 rounded-full">
                      {sectionDocs.length}
                    </span>
                  )}
                </button>

                {/* Section docs */}
                {!collapsed && (
                  <div className="pl-4 space-y-0.5">
                    {sectionDocs.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground/50 italic px-2 py-1">No documents yet</p>
                    ) : (
                      sectionDocs.map(doc => (
                        <DocItem
                          key={doc.id}
                          doc={doc}
                          active={doc.id === activeDocId || toSlug(doc.title) === activeDocId}
                          onClick={() => navigate(doc)}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer: Version info */}
      <div className="px-5 py-3 border-t border-border/20 shrink-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 text-center">
          {project?.name} · Powered by Little Seeds
        </p>
      </div>
    </div>
  );
}

function DocItem({ doc, active, onClick }: { doc: any; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-[11px] font-medium transition-all',
        active
          ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary pl-2'
          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
      )}
    >
      <span className="text-sm shrink-0 select-none">{doc.emoji || '📄'}</span>
      <span className="flex-1 truncate">{doc.title}</span>
    </button>
  );
}
