'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LuPlus as Plus, LuFileText as FileText, LuFolder as Folder, LuSearch as Search, LuEllipsis as MoreHorizontal, LuArrowLeft as ArrowLeft,
  LuTrash2 as Trash2, LuPen as Edit3, LuBookOpen as BookOpen, LuCode as Code2, LuWorkflow as Workflow, LuUsers as Users2, LuStar as Star, LuClock as Clock,
  LuChevronRight as ChevronRight, LuFolderPlus as FolderPlus, LuStickyNote as StickyNote, LuX as X, LuFileCheck as FileCheck, LuGraduationCap as GraduationCap, LuUsers as Users,
  LuShieldAlert as ShieldAlert, LuBackpack as Backpack, LuBriefcase as Briefcase, LuChevronDown as ChevronDown, LuPalette as Palette, LuSun as Sun, LuMoon as Moon, LuType as Type, LuCheck as Check, LuSlidersHorizontal as Sliders,
  LuLink2 as Link2, LuCircleAlert as AlertCircle, LuSend as Send
} from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProjectStore, ProjectPortalTheme } from '@/store/useProjectStore';
import { useDocumentStore, Doc } from '@/store/useDocumentStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import { Select } from '@/components/ui/select';
import ShareModal from '@/components/shared/ShareModal';
import { getSectionIconSelectOptions } from '@/lib/sectionIcons';

type Tab = 'docs' | 'recent';

const ACCENT_COLOR_MAP: Record<string, string> = {
  blue: '#3b82f6',
  purple: '#a855f7',
  green: '#10b981',
  rose: '#f43f5e',
  amber: '#f59e0b',
  cyan: '#06b6d4',
  orange: '#f97316',
  mint: '#2dd4bf',
  crimson: '#9f1239',
};

const FONT_OPTIONS = [
  { value: 'inter',       label: 'Inter',       preview: 'Aa' },
  { value: 'outfit',      label: 'Outfit',      preview: 'Aa' },
  { value: 'roboto',      label: 'Roboto',      preview: 'Aa' },
  { value: 'montserrat',  label: 'Montserrat',  preview: 'Aa' },
  { value: 'mono',        label: 'Mono',        preview: 'Aa' },
];

// ── Portal Theme Modal ───────────────────────────────────────────────────────
function PortalThemeModal({ project, onClose }: { project: any; onClose: () => void }) {
  const { updateProject } = useProjectStore();
  const existing = project.portalTheme || { mode: 'dark', accentColor: 'blue', fontFamily: 'inter', fontSize: 'base' };
  const [theme, setTheme] = useState<ProjectPortalTheme>({ fontSize: 'base', ...existing });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateProject(project.id, { portalTheme: theme });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl space-y-6 relative max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin select-none">
        <button onClick={onClose} className="absolute right-4 top-4 p-1.5 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-all cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <h2 className="text-lg font-black text-foreground uppercase tracking-wider font-outfit flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" /> Client Portal Theme
          </h2>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            Set the look & feel clients see when they log in to{' '}
            <span className="font-bold text-foreground">{project.icon} {project.name}</span>.
          </p>
        </div>

        <div className="space-y-5">
          {/* Mode toggle */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Appearance Mode</p>
            <div className="flex gap-3">
              {(['dark', 'light'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setTheme(t => ({ ...t, mode: m }))}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                    theme.mode === m
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-border hover:bg-accent text-muted-foreground'
                  )}
                >
                  {m === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  {m === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  {theme.mode === m && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Accent colour */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accent Colour</p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center bg-accent/10 border border-border p-4 rounded-2xl animate-in fade-in duration-200">
              {/* Color Swatch & System Picker */}
              <label className="flex items-center justify-center w-14 h-14 rounded-xl border border-border hover:border-primary/55 cursor-pointer relative transition-all group overflow-hidden bg-card shadow-sm shrink-0">
                <input
                  type="color"
                  value={theme.accentColor.startsWith('#') ? theme.accentColor : (ACCENT_COLOR_MAP[theme.accentColor] || '#6366f1')}
                  onChange={e => setTheme(t => ({ ...t, accentColor: e.target.value }))}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <span 
                  className="w-8 h-8 rounded-lg shadow-inner transition-transform group-hover:scale-110 border border-black/10" 
                  style={{ 
                    backgroundColor: theme.accentColor.startsWith('#') 
                      ? theme.accentColor 
                      : (ACCENT_COLOR_MAP[theme.accentColor] || '#6366f1') 
                  }} 
                />
              </label>

              {/* Input Hex Details */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Custom hex value</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-muted-foreground/60 select-none">#</span>
                  <input
                    type="text"
                    value={(theme.accentColor.startsWith('#') ? theme.accentColor : (ACCENT_COLOR_MAP[theme.accentColor] || '#6366f1')).replace('#', '')}
                    onChange={e => {
                      const val = e.target.value;
                      const cleanVal = val.replace(/[^a-fA-F0-9]/g, '');
                      if (cleanVal.length <= 6) {
                        setTheme(t => ({ ...t, accentColor: `#${cleanVal}` }));
                      }
                    }}
                    className="bg-transparent text-sm font-black text-foreground focus:outline-none w-full tracking-wider font-mono uppercase border-b border-border/80 focus:border-primary/50 py-0.5"
                    placeholder="FFFFFF"
                    maxLength={6}
                  />
                </div>
              </div>

              {/* Add Color Action Button */}
              <label className="flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-border hover:bg-accent text-xs font-bold transition-all cursor-pointer bg-card hover:border-primary/20 shrink-0 select-none relative">
                <input
                  type="color"
                  value={theme.accentColor.startsWith('#') ? theme.accentColor : (ACCENT_COLOR_MAP[theme.accentColor] || '#6366f1')}
                  onChange={e => setTheme(t => ({ ...t, accentColor: e.target.value }))}
                  className="absolute inset-0 opacity-0 cursor-pointer w-0 h-0"
                />
                <Palette className="w-4 h-4 text-primary" />
                <span>Add Color</span>
              </label>
            </div>
          </div>

          {/* Font */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Type className="w-3 h-3" /> Font Family
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {FONT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(t => ({ ...t, fontFamily: opt.value }))}
                  className={cn(
                    'px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-center relative hover:shadow-xs hover:border-primary/20 cursor-pointer',
                    theme.fontFamily === opt.value
                      ? 'bg-primary/10 border-primary text-primary font-black'
                      : 'border-border hover:bg-accent text-muted-foreground'
                  )}
                >
                  <span>{opt.label}</span>
                  <span className="block text-[9px] font-medium opacity-50 tracking-wider">Aa</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Sliders className="w-3 h-3" /> Font Size
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {([
                { value: 'sm', label: 'Small', details: '14px' },
                { value: 'base', label: 'Normal', details: '16px' },
                { value: 'lg', label: 'Large', details: '18px' },
                { value: 'xl', label: 'Extra', details: '20px' }
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTheme(t => ({ ...t, fontSize: opt.value }))}
                  className={cn(
                    'px-2 py-2 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center hover:shadow-xs hover:border-primary/20 cursor-pointer',
                    (theme.fontSize || 'base') === opt.value
                      ? 'bg-primary/10 border-primary text-primary font-black'
                      : 'border-border hover:bg-accent text-muted-foreground'
                  )}
                >
                  <span>{opt.label}</span>
                  <span className="text-[9px] font-normal opacity-65 mt-0.5">{opt.details}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live preview chip */}
          <div
            className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-accent/5 relative overflow-hidden text-left"
            data-accent={theme.accentColor.startsWith('#') ? undefined : theme.accentColor}
            style={{ 
              fontFamily: `var(--font-${theme.fontFamily})`,
              borderColor: theme.accentColor.startsWith('#') ? theme.accentColor + '50' : undefined
            }}
          >
            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div 
              className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm shrink-0', theme.mode === 'dark' ? 'bg-slate-800 border border-slate-700/50' : 'bg-white border border-slate-200/50')}
              style={{
                color: theme.accentColor.startsWith('#') ? theme.accentColor : undefined,
                backgroundColor: theme.accentColor.startsWith('#') ? theme.accentColor + '20' : undefined
              }}
            >
              {project.icon || '✨'}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('text-xs font-black uppercase tracking-wider truncate', theme.mode === 'dark' ? 'text-slate-100' : 'text-slate-900')}>{project.name}</p>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wide mt-0.5">
                {theme.mode === 'dark' ? '🌙 Dark' : '☀️ Light'} • Color: {theme.accentColor.startsWith('#') ? theme.accentColor : (ACCENT_COLOR_MAP[theme.accentColor] || theme.accentColor)} • {FONT_OPTIONS.find(f => f.value === theme.fontFamily)?.label} • Size: {theme.fontSize || 'base'}
              </p>
            </div>
            <div 
              className="shrink-0 border rounded-md px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest"
              style={{
                color: theme.accentColor.startsWith('#') ? theme.accentColor : 'var(--primary)',
                borderColor: theme.accentColor.startsWith('#') ? theme.accentColor + '30' : 'var(--primary-foreground)',
                backgroundColor: theme.accentColor.startsWith('#') ? theme.accentColor + '10' : 'var(--primary)/10'
              }}
            >
              Live Preview
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" className="flex-1 border-border/40 hover:bg-accent cursor-pointer" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold cursor-pointer"
          >
            {saving ? 'Saving…' : 'Save Theme'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SectionsModal({ project, onClose }: { project: any; onClose: () => void }) {
  const { updateProject } = useProjectStore();
  const [customSections, setCustomSections] = useState<Array<{ id: string; label: string; icon: string }>>(
    project.sections && project.sections.length > 0
      ? project.sections
      : [{ id: `sec_${Math.random().toString(36).slice(2, 7)}`, label: 'New Custom Section', icon: 'BookOpen' }]
  );

  const handleAddCustomSection = () => {
    const newId = `sec_${Math.random().toString(36).slice(2, 7)}`;
    setCustomSections(prev => [...prev, { id: newId, label: 'New Custom Section', icon: 'BookOpen' }]);
  };

  const handleRemoveCustomSection = (id: string) => {
    setCustomSections(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateSectionLabel = (id: string, label: string) => {
    setCustomSections(prev => prev.map(s => s.id === id ? { ...s, label } : s));
  };

  const handleUpdateSectionIcon = (id: string, icon: string) => {
    setCustomSections(prev => prev.map(s => s.id === id ? { ...s, icon } : s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedSections = customSections.map(s => ({
      id: s.id,
      label: s.label.trim(),
      icon: s.icon
    }));
    await updateProject(project.id, { sections: formattedSections });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-6 relative text-left">
        <button onClick={onClose} className="absolute right-4 top-4 p-1 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <h2 className="text-base font-black text-foreground uppercase tracking-wider font-outfit">Configure Module Sections</h2>
          <p className="text-xs text-muted-foreground font-medium">Add, rename, or delete the custom category tabs inside your workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3 p-4 bg-accent/50 border border-border rounded-2xl max-h-[300px] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Workspace Custom Sections</span>
              <button
                type="button"
                onClick={handleAddCustomSection}
                className="text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-2.5 h-2.5" /> Add Section
              </button>
            </div>

            <div className="space-y-2">
              {customSections.map((section, idx) => (
                <div key={section.id} className="flex flex-col gap-2.5 bg-card border border-border p-3 rounded-2xl hover:border-primary/20 hover:shadow-lg transition-all group/item">
                  <div className="relative w-full">
                    <Select
                      value={section.icon}
                      onChange={val => handleUpdateSectionIcon(section.id, val)}
                      options={getSectionIconSelectOptions()}
                      className="w-full"
                      triggerClassName="h-10 px-3 rounded-xl"
                    />
                  </div>

                  <div className="flex w-full items-center gap-2">
                    <input
                      type="text"
                      required
                      value={section.label}
                      onChange={e => handleUpdateSectionLabel(section.id, e.target.value)}
                      placeholder={`Section ${idx + 1} name...`}
                      className="flex-1 min-w-0 bg-background border border-border hover:border-border/85 focus:border-primary/40 focus:bg-background rounded-xl px-3 h-10 text-xs font-bold text-foreground focus:outline-none transition-all placeholder:text-muted-foreground/50"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomSection(section.id)}
                      className="bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 hover:text-rose-600 transition-colors shrink-0 cursor-pointer flex items-center justify-center h-10 w-10"
                      title="Remove custom section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {customSections.length === 0 && (
                <p className="text-[10px] text-muted-foreground/60 italic text-center py-4 select-none">No custom sections. Click Add Section above.</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1 border-border/40 hover:bg-accent" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
              Save Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DocCard({ doc, onDelete }: { doc: Doc; onDelete: () => void }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { projects } = useProjectStore();

  const project = projects.find(p => p.id === doc.projectId);
  const customSec = project?.sections?.find(s => s.id === doc.category);

  const getCategoryMeta = () => {
    if (customSec) {
      const Icon = customSec.icon === 'GraduationCap' ? GraduationCap
                 : customSec.icon === 'ShieldAlert' ? ShieldAlert
                 : customSec.icon === 'Backpack' ? Backpack
                 : customSec.icon === 'Code2' ? Code2
                 : customSec.icon === 'Briefcase' ? Briefcase
                 : customSec.icon === 'Users2' ? Users2
                 : BookOpen;
      const color = doc.category === 'teacher' ? 'text-emerald-400'
                  : doc.category === 'admin' ? 'text-purple-400'
                  : doc.category === 'student' ? 'text-amber-400'
                  : doc.category === 'developer' ? 'text-sky-400'
                  : 'text-emerald-400';
      const bg = doc.category === 'teacher' ? 'bg-emerald-400/10'
               : doc.category === 'admin' ? 'bg-purple-400/10'
               : doc.category === 'student' ? 'bg-amber-400/10'
               : doc.category === 'developer' ? 'bg-sky-400/10'
               : 'bg-emerald-400/10';

      return {
        label: customSec.label,
        icon: Icon,
        color,
        bg
      };
    }

    return {
      label: doc.category.toUpperCase(),
      icon: FileText,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10'
    };
  };

  const meta = getCategoryMeta();
  const Icon = meta.icon;

  return (
    <div
      onClick={() => router.push(`/dashboard/documents/${doc.id}`)}
      className="group relative bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', meta.bg)}>
          {doc.emoji ? (
            <span className="text-lg">{doc.emoji}</span>
          ) : (
            <Icon className={cn('w-4 h-4', meta.color)} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{doc.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className={cn('text-[9px] uppercase px-1.5 py-0 border-0', meta.bg, meta.color)}>
              {meta.label}
            </Badge>
            <span className="text-[10px] text-muted-foreground">{doc.wordCount} words</span>
          </div>
        </div>
        <button
          onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="opacity-0 group-hover:opacity-100 h-7 w-7 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground transition-all"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {menuOpen && (
        <div className="absolute right-2 top-10 z-50 bg-card border border-border rounded-xl shadow-2xl py-1 w-36" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { router.push(`/dashboard/documents/${doc.id}`); setMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-xs hover:bg-accent flex items-center gap-2"
          >
            <Edit3 className="w-3 h-3" /> Open
          </button>
          <button
            onClick={() => { onDelete(); setMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-xs hover:bg-accent text-rose-500 flex items-center gap-2"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/50">
        <span className={cn('text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
          doc.status === 'published' ? 'text-emerald-600 bg-emerald-500/10' :
          doc.status === 'archived' ? 'text-muted-foreground bg-accent' :
          'text-amber-600 bg-amber-500/10'
        )}>{doc.status}</span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {format(new Date(doc.updatedAt), 'MMM d')}
        </span>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { projects } = useProjectStore();
  const { documents, createDocument, deleteDocument } = useDocumentStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'admin';

  const [tab, setTab] = useState<Tab>('docs');
  const [search, setSearch] = useState('');
  const [showSectionsModal, setShowSectionsModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showNewDocDropdown, setShowNewDocDropdown] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const project = projects.find(p => p.id === id);
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
          <Folder className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold mb-2">Module Not Found</h3>
        <p className="text-sm text-muted-foreground mb-6">This module may have been deleted.</p>
        <Button onClick={() => router.push('/dashboard/projects')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Modules
        </Button>
      </div>
    );
  }

  const projectDocs = documents.filter(d => 
    d.projectId === id && 
    (isAdmin ? true : d.status === 'published')
  );
  const recentDocs = [...projectDocs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 6);

  const filteredDocs = projectDocs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  const handleCreateDoc = async (parentId?: string | null, category: string = 'teacher') => {
    const doc = await createDocument(parentId ?? null, id, category);
    router.push(`/dashboard/documents/${doc.id}`);
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => router.push('/dashboard/projects')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: project.color + '25' }}>
            {project.icon}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold truncate">{project.name}</h1>
            {project.description && <p className="text-xs text-muted-foreground truncate">{project.description}</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto w-full sm:w-auto justify-end">
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowThemeModal(true)}
                className="gap-1.5 sm:gap-2 border-border/40 hover:bg-accent font-semibold px-2.5 sm:px-3"
                title="Portal Theme"
              >
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Portal Theme</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareModal(true)}
                className="gap-1.5 sm:gap-2 border-border/40 hover:bg-accent font-semibold px-2.5 sm:px-3"
                title="Share Module"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSectionsModal(true)}
                className="gap-1.5 sm:gap-2 border-border/40 hover:bg-accent font-semibold px-2.5 sm:px-3"
                title="Manage Sections"
              >
                <Workflow className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Manage Sections</span>
              </Button>
            </>
          )}

          <div className="relative">
            <Button
              size="sm"
              onClick={() => {
                if (project.sections && project.sections.length > 0) {
                  setShowNewDocDropdown(!showNewDocDropdown);
                } else if (isAdmin) {
                  setShowSectionsModal(true);
                }
              }}
              className="gap-1.5 sm:gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-black cursor-pointer px-2.5 sm:px-3"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Document</span>
            </Button>
            {showNewDocDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNewDocDropdown(false)} />
                <div className="absolute right-0 top-full mt-1.5 z-50 bg-card border border-border rounded-xl shadow-2xl py-1.5 w-48 text-foreground animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1 text-[9px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/20 mb-1">
                    Select Section
                  </div>
                  {project.sections && project.sections.length > 0 ? (
                    project.sections.map(section => (
                      <button
                        key={section.id}
                        onClick={() => {
                          handleCreateDoc(null, section.id);
                          setShowNewDocDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-accent flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <span className="text-sm shrink-0">
                          {section.icon === 'GraduationCap' ? '🎓'
                           : section.icon === 'ShieldAlert' ? '🛡️'
                           : section.icon === 'Backpack' ? '🎒'
                           : section.icon === 'Code2' ? '💻'
                           : section.icon === 'Briefcase' ? '💼'
                           : section.icon === 'Users2' ? '👥'
                           : '📝'}
                        </span>
                        <span className="truncate">{section.label}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-[10px] text-muted-foreground italic font-semibold leading-relaxed">
                      No custom sections created yet.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {[
          { label: 'Total Documents', value: projectDocs.length, icon: FileText, color: 'text-primary' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Icon className={cn('w-4 h-4', stat.color)} />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-accent/50 rounded-xl border border-border mb-6 w-fit">
        {([
          { id: 'docs', label: 'Documents', icon: FileText },
          { id: 'recent', label: 'Recent', icon: Clock },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              tab === t.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${tab}...`}
          className="pl-9 h-9 bg-accent/30"
        />
      </div>

      {/* DOCS TAB */}
      {/* DOCS TAB */}
      {tab === 'docs' && (
        <div className="space-y-10 flex-1">
          {project.sections && project.sections.length > 0 ? (
            project.sections.map(section => {
              const role = section.id;
              const sectionDocs = filteredDocs.filter(d => d.category === role);
              
              const Icon = section.icon === 'GraduationCap' ? GraduationCap
                         : section.icon === 'ShieldAlert' ? ShieldAlert
                         : section.icon === 'Backpack' ? Backpack
                         : section.icon === 'Code2' ? Code2
                         : section.icon === 'Briefcase' ? Briefcase
                         : section.icon === 'Users2' ? Users2
                         : BookOpen;

              const accentColor = role === 'teacher' ? 'from-primary/20 to-primary/5 border-primary/30 text-primary'
                                : role === 'admin' ? 'from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-450'
                                : role === 'student' ? 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-500'
                                : role === 'developer' ? 'from-sky-500/20 to-sky-500/5 border-sky-500/30 text-sky-500'
                                : 'from-primary/20 to-primary/5 border-primary/30 text-primary';

              return (
                <div 
                  key={role} 
                  className="bg-card/60 border border-border/40 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden backdrop-blur-md shadow-xl"
                >
                  {/* Decorative section glow */}
                  <div className={cn("absolute -right-20 -top-20 w-48 h-48 rounded-full blur-3xl opacity-20 bg-linear-to-br", accentColor)} />
                  
                  {/* Section Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-lg bg-background border", accentColor)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-foreground uppercase tracking-wide font-outfit">{section.label} Manuals</h2>
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{sectionDocs.length} Documents</p>
                      </div>
                    </div>
                    
                    {isAdmin && (
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleCreateDoc(null, role)}
                          className="h-8 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl shadow-lg shadow-primary/10 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Document</span>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Section Content */}
                  <div className="space-y-6 relative z-10 text-left">
                    {sectionDocs.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sectionDocs.map(doc => (
                          <DocCard key={doc.id} doc={doc} onDelete={() => deleteDocument(doc.id)} />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center bg-accent/20 rounded-2xl border border-dashed border-border p-6 select-none">
                        <FileText className="w-8 h-8 text-muted-foreground mb-3" />
                        <h4 className="text-xs font-bold text-foreground/90 uppercase tracking-wider">No Guides in {section.label}</h4>
                        <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">There are currently no manuals, code resources, or documents published under this category.</p>
                        {isAdmin && (
                          <Button 
                            onClick={() => handleCreateDoc(null, role)} 
                            className="mt-4 h-8 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/30 text-xs font-bold px-4 rounded-xl transition-all"
                          >
                            Create First Document
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-base font-bold mb-2">No Sections Configured</h3>
              <p className="text-sm text-muted-foreground mb-5">Set up custom categories/sections first to organize your project.</p>
              {isAdmin && (
                <Button className="gap-2" onClick={() => setShowSectionsModal(true)}>
                  <Workflow className="w-4 h-4" /> Configure Sections
                </Button>
              )}
            </div>
          )}
        </div>
      )}



      {/* RECENT TAB */}
      {tab === 'recent' && (
        <div className="flex-1">
          {recentDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="w-10 h-10 text-muted-foreground mb-4" />
              <h3 className="font-bold mb-2">No recent activity</h3>
              <p className="text-sm text-muted-foreground">Docs you edit will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentDocs.map(doc => (
                <DocCard key={doc.id} doc={doc} onDelete={() => deleteDocument(doc.id)} />
              ))}
            </div>
          )}
        </div>
      )}
      {showSectionsModal && (
        <SectionsModal project={project} onClose={() => setShowSectionsModal(false)} />
      )}
      {showThemeModal && (
        <PortalThemeModal project={project} onClose={() => setShowThemeModal(false)} />
      )}
      {showShareModal && (
        <ShareModal project={project} onClose={() => setShowShareModal(false)} />
      )}

      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-100 flex items-center gap-3 p-4 rounded-xl bg-primary text-primary-foreground shadow-2xl max-w-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="flex-1 text-xs font-bold">
              {toastMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
