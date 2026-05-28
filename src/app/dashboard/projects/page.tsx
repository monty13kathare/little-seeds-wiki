'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Folder, MoreHorizontal, FileText, Trash2, Pen as Edit3,
  Search, BookOpen, Calendar, FolderKanban, X,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProjectStore, Project } from '@/store/useProjectStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import ProjectModal from '@/components/shared/ProjectModal';
import ShareModal from '@/components/shared/ShareModal';

const ACCENT_COLOR_MAP: Record<string, string> = {
  blue: '#3b82f6',
  purple: '#a855f7',
  green: '#10b981',
  rose: '#f43f5e',
  red: '#ef4444',
  amber: '#f59e0b',
  cyan: '#06b6d4',
  orange: '#f97316',
  mint: '#2dd4bf',
  crimson: '#9f1239',
};

const resolveProjectColor = (project: Project) => {
  const accent = project.portalTheme?.accentColor;
  if (accent) {
    if (accent.startsWith('#')) return accent;
    if (ACCENT_COLOR_MAP[accent]) return ACCENT_COLOR_MAP[accent];
  }
  return project.color || 'var(--primary)';
};


function ProjectCard({ project, docCount, onClick, onEdit, onDelete, onShare, isAdmin }: {
  project: Project; docCount: number;
  onClick: () => void; onEdit: () => void; onDelete: () => void; onShare: () => void; isAdmin: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      onClick={onClick}
      style={{ borderColor: resolveProjectColor(project), borderLeftWidth: '4px' } as any}
      className="group relative bg-card border rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer overflow-hidden flex flex-col justify-between min-h-[200px] h-full"
    >
      <div className="space-y-4 relative z-10 flex-1">
        <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: project.color + '20' }}>
          {project.icon}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isAdmin && (
            <button
              onClick={e => { e.stopPropagation(); onShare(); }}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Share Module"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors relative"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        {menuOpen && (
          <div className="absolute right-4 top-14 z-50 bg-card border border-border rounded-xl shadow-2xl py-1 w-40 animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <button onClick={() => { onEdit(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 font-semibold">
              <Edit3 className="w-3.5 h-3.5" /> Edit Module
            </button>
            <button onClick={() => { onDelete(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-accent text-rose-500 flex items-center gap-2 font-semibold">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-base font-bold mb-1 truncate group-hover:text-primary transition-colors">{project.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-semibold">{project.description || 'No description'}</p>
      </div>
      
      </div>

      <div className="flex items-center justify-between pt-3 mt-4 border-t border-border/50 relative z-10">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
          <FileText className="w-3 h-3" />
          <span>{docCount} docs</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{format(new Date(project.createdAt), 'MMM d')}</span>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { projects, deleteProject } = useProjectStore();
  const { documents } = useDocumentStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [shareProject, setShareProject] = useState<Project | null>(null);
  const [editProject, setEditProject] = useState<Project | undefined>(undefined);

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'admin';

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const getDocCount = (projectId: string) => documents.filter(d => d.projectId === projectId).length;

  return (
    <div className="flex flex-col h-full p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Modules</h1>
          <p className="text-sm text-muted-foreground mt-1">{projects.length} modules · Manage your workspaces</p>
        </div>
        <Button onClick={() => { setEditProject(undefined); setShowModal(true); }} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Create New Module
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search modules..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="pl-9 h-10 bg-accent/30"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
            <FolderKanban className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold mb-2">{search ? 'No modules found' : 'No modules yet'}</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            {search ? 'Try a different search term.' : 'Create your first module to organize your docs and notes.'}
          </p>
          {!search && <Button onClick={() => setShowModal(true)} className="gap-2"><Plus className="w-4 h-4" /> Create Module</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              docCount={getDocCount(project.id)}
              isAdmin={isAdmin}
              onClick={() => router.push(`/dashboard/projects/${project.id}`)}
              onEdit={() => { setEditProject(project); setShowModal(true); }}
              onDelete={() => deleteProject(project.id)}
              onShare={() => setShareProject(project)}
            />
          ))}
          {/* Create new card */}
          <button
            onClick={() => { setEditProject(undefined); setShowModal(true); }}
            className="border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all group min-h-[200px] h-full"
          >
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium">New Module</span>
          </button>
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editProject}
          onClose={() => { setShowModal(false); setEditProject(undefined); }}
        />
      )}
      
      {shareProject && (
        <ShareModal project={shareProject} onClose={() => setShareProject(null)} />
      )}
    </div>
  );
}
