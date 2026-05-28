'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Star, Pin, MoreVertical, Trash2, Edit3, FolderPlus, X,
  Code2, GraduationCap, ShieldAlert, Backpack, Eye, PenTool, ChevronDown, ChevronRight,
  Briefcase, Users2, BookOpen, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocumentStore, Doc } from '@/store/useDocumentStore';
import { useProjectStore, getProjectSections } from '@/store/useProjectStore';
import { useSimulatedProfileStore } from '@/store/useSimulatedProfileStore';
import ProjectModal from '@/components/shared/ProjectModal';

type ClientRole = string;

export default function DocsSidebar({ onMobileClose }: { onMobileClose?: () => void }) {
  const router = useRouter();
  
  const { 
    documents, activeDocId, createDocument, 
    deleteDocument, setActiveDoc, togglePin, 
    toggleFavorite, updateDocument 
  } = useDocumentStore();
  const { activeProjectId, projects } = useProjectStore();
  const { getActiveProfile } = useSimulatedProfileStore();

  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeProfile = getActiveProfile();

  const [isReaderModeState, setIsReaderModeState] = useState(false);
  const [search, setSearch] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);

  // Lock client viewers strictly into Reader mode
  const isReaderMode = !activeProfile.isWriter || isReaderModeState;
  
  // Track open/collapsed categories
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});



  const toggleCategory = (role: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [role]: !prev[role]
    }));
  };

  const handleNewDoc = async (category: string, parentId?: string) => {
    const doc = await createDocument(parentId || null, activeProjectId, category);
    router.push(`/dashboard/documents/${doc.id}`);
    onMobileClose?.();
  };

  const startRename = (doc: Doc) => {
    setRenamingId(doc.id);
    setRenameVal(doc.title);
  };

  const commitRename = () => {
    if (renamingId && renameVal.trim()) {
      updateDocument(renamingId, { title: renameVal.trim() });
    }
    setRenamingId(null);
  };



  // Filter documents by currently active project and respect reader mode status constraint
  const projectDocs = documents.filter(d => 
    d.projectId === activeProjectId && 
    (isReaderMode ? d.status === 'published' : true)
  );


  // Filter active project custom sections by active profile allowed lists (if restricted)
  const customSections = getProjectSections(activeProject);
  const allowedCategories = customSections
    .filter(section => {
      if (activeProfile.allowedCategories && activeProfile.allowedCategories.length > 0) {
        return activeProfile.allowedCategories.includes(section.id as any);
      }
      return true;
    })
    .map(s => s.id);

  const filteredDocs = search
    ? projectDocs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) && allowedCategories.includes(d.category))
    : null;

  return (
    <div className="w-80 shrink-0 h-full border-r border-border/60 bg-card/95 backdrop-blur-xl flex flex-col font-inter text-foreground">
      
      {/* Platform & Mode Toggle Header */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg shrink-0">{activeProject?.icon || '🌱'}</span>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-extrabold text-xs tracking-wider uppercase text-foreground font-outfit truncate">
                  {activeProject?.name || 'Module'} Docs
                </span>
                {activeProfile.isWriter && (
                  <button
                    onClick={() => setIsEditProjectOpen(true)}
                    className="p-1 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground cursor-pointer transition-colors shrink-0"
                    title="Edit Sections & Settings"
                  >
                    <Settings className="w-3 h-3 text-primary animate-pulse" />
                  </button>
                )}
              </div>
              <span className="text-[9px] text-primary font-black uppercase tracking-widest leading-none mt-0.5 select-none">
                {activeProject?.category || 'School Based'}
              </span>
            </div>
          </div>
          
          {/* Reader vs Writer Toggle Switch (Only enabled for writers like Super Admin) */}
          {activeProfile.isWriter ? (
            <div className="flex items-center bg-accent rounded-xl p-0.5 border border-border select-none">
              <button
                onClick={() => setIsReaderModeState(true)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                  isReaderModeState 
                    ? "bg-primary/10 text-primary shadow-xs" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Eye className="w-2.5 h-2.5" /> Reader
              </button>
              <button
                onClick={() => setIsReaderModeState(false)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                  !isReaderModeState 
                    ? "bg-primary/10 text-primary shadow-xs" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <PenTool className="w-2.5 h-2.5" /> Writer
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 border border-primary/20 rounded-lg text-[10px] font-bold text-primary select-none">
              <Eye className="w-2.5 h-2.5" /> Client Reader Only
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${activeProject?.name || 'manuals'}...`}
            className="w-full bg-accent border border-border rounded-xl pl-9 pr-8 py-2 text-xs font-semibold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all"
          />
          {search && (
            <button 
              onClick={() => setSearch('')} 
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-accent rounded-md"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Explorer Tree */}
      <div className="flex-1 overflow-y-auto py-5 px-4 space-y-6 scrollbar-thin">
        {filteredDocs ? (
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest px-3 mb-2 select-none">
              {filteredDocs.length} Matches Found
            </p>
            {filteredDocs.map(doc => (
              <DocItem 
                key={doc.id} 
                doc={doc} 
                allDocs={projectDocs.filter(d => d.category === doc.category)} 
                onRename={startRename} 
                renamingId={renamingId} 
                renameVal={renameVal} 
                setRenameVal={setRenameVal} 
                commitRename={commitRename} 
                level={0} 
                isReaderMode={isReaderMode}
                onMobileClose={onMobileClose} 
              />
            ))}
          </div>
        ) : (
          <>
            {allowedCategories.length === 0 && (
              <div className="py-12 text-center px-4 border border-dashed border-border/20 rounded-2xl bg-accent/50 max-w-[280px] mx-auto space-y-4">
                <BookOpen className="w-8 h-8 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">No sections created</p>
                  <p className="text-[10px] text-muted-foreground italic mt-1 font-semibold leading-relaxed">
                    This project does not have any custom document manuals configured yet.
                  </p>
                </div>
                {activeProfile.isWriter && (
                  <button
                    onClick={() => {
                      setIsEditProjectOpen(true);
                    }}
                    className="mx-auto text-[9.5px] font-black uppercase tracking-wider text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 cursor-pointer bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5" /> Configure Sections
                  </button>
                )}
              </div>
            )}
            {allowedCategories.map(role => {
              const section = customSections.find(s => s.id === role) || { id: role, label: role.toUpperCase(), icon: 'BookOpen' };
              const Icon = section.icon === 'GraduationCap' ? GraduationCap
                         : section.icon === 'ShieldAlert' ? ShieldAlert
                         : section.icon === 'Backpack' ? Backpack
                         : section.icon === 'Code2' ? Code2
                         : section.icon === 'Briefcase' ? Briefcase
                         : section.icon === 'Users2' ? Users2
                         : BookOpen;

              const iconColor = section.id === 'teacher' ? 'text-primary'
                              : section.id === 'admin' ? 'text-purple-400'
                              : section.id === 'student' ? 'text-amber-400'
                              : section.id === 'developer' ? 'text-sky-400'
                              : 'text-primary';

              const meta = {
                label: section.label,
                icon: Icon,
                color: iconColor
              };

              const isCollapsed = collapsedCategories[role] ?? false;

              // Filter docs belonging to this category and project
              const catDocs = projectDocs.filter(d => d.category === role);
              const rootDocs = catDocs.filter(d => !d.parentId);
              const pinned = catDocs.filter(d => d.isPinned);

              return (
                <div key={role} className="space-y-2 border-b border-border/10 pb-4 last:border-0">
                  
                  {/* Category Title Header */}
                  <div className="flex items-center justify-between px-2 py-1.5 group/cat">
                    <button
                      onClick={() => toggleCategory(role)}
                      className="flex items-center gap-2 text-left cursor-pointer hover:text-foreground transition-colors"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                      <Icon className={cn("w-4 h-4 shrink-0", meta.color)} />
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground font-outfit">
                        {meta.label}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-bold bg-accent px-1.5 py-0.5 rounded-full border border-border">
                        {catDocs.length}
                      </span>
                    </button>

                    {/* Writer Controls at Category Level */}
                    {!isReaderMode && (
                      <div className="flex items-center gap-1 opacity-0 group-hover/cat:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleNewDoc(role)}
                          className="p-0.5 hover:bg-accent rounded text-primary transition-all cursor-pointer"
                          title="Add Manual"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Section Content */}
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-4 space-y-3"
                      >
                        {/* Root Manuals */}
                        {rootDocs.map(doc => (
                          <DocItem 
                            key={doc.id} 
                            doc={doc} 
                            allDocs={catDocs} 
                            onRename={startRename} 
                            renamingId={renamingId} 
                            renameVal={renameVal} 
                            setRenameVal={setRenameVal} 
                            commitRename={commitRename} 
                            level={0} 
                            isReaderMode={isReaderMode}
                            onMobileClose={onMobileClose} 
                          />
                        ))}

                        {catDocs.length === 0 && (
                          <p className="text-[10px] text-muted-foreground italic px-3 py-1 select-none">
                            No guidelines created yet.
                          </p>
                        )}

                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </>
        )}
      </div>

      {isEditProjectOpen && activeProject && (
        <ProjectModal 
          project={activeProject} 
          onClose={() => setIsEditProjectOpen(false)} 
        />
      )}
    </div>
  );
}

function DocItem({ doc, allDocs, onRename, level = 0, renamingId, renameVal, setRenameVal, commitRename, onMobileClose, isReaderMode }: {
  doc: Doc; allDocs: Doc[]; onRename: (d: Doc) => void; level?: number;
  renamingId: string | null; renameVal: string; setRenameVal: (v: string) => void; commitRename: () => void; onMobileClose?: () => void;
  isReaderMode: boolean;
}) {
  const router = useRouter();
  const { setActiveDoc, deleteDocument, togglePin, toggleFavorite, createDocument, activeDocId } = useDocumentStore();
  const [showMenu, setShowMenu] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const isRenaming = renamingId === doc.id;
  const active = doc.id === activeDocId;
  
  const childDocs = allDocs.filter(d => d.parentId === doc.id);
  const hasChildren = childDocs.length > 0;

  const handleSelect = () => {
    setActiveDoc(doc.id); 
    router.push(`/dashboard/documents/${doc.id}`); 
    onMobileClose?.();
  };

  const handleNewSubDoc = async () => {
    const newDoc = await createDocument(doc.id, doc.projectId, doc.category);
    router.push(`/dashboard/documents/${newDoc.id}`);
  };

  const activeStyles = ({
    teacher: 'text-primary font-bold bg-primary/5',
    admin: 'text-purple-400 font-bold bg-purple-500/5',
    student: 'text-amber-400 font-bold bg-amber-500/5',
    developer: 'text-sky-400 font-bold bg-sky-500/5',
  }[doc.category] || 'text-primary font-bold bg-primary/5');

  const activeBarStyles = ({
    teacher: 'bg-primary',
    admin: 'bg-purple-500',
    student: 'bg-amber-500',
    developer: 'bg-sky-500',
  }[doc.category] || 'bg-primary');

  return (
    <div className="space-y-0.5 relative animate-in fade-in-50 duration-200">
      <div
        className={cn(
          'group flex items-center justify-between py-1.5 px-3 rounded-lg text-[11px] font-semibold transition-all cursor-pointer relative',
          active 
            ? activeStyles 
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        )}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={handleSelect}
      >
        {active && (
          <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r animate-pulse", activeBarStyles)} />
        )}

        {isRenaming ? (
          <input
            autoFocus
            value={renameVal}
            onChange={e => setRenameVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') commitRename(); }}
            onBlur={commitRename}
            onClick={e => e.stopPropagation()}
            className="flex-1 bg-transparent border-b border-primary/50 text-[11px] font-bold focus:outline-none min-w-0 py-0.5 text-foreground"
          />
        ) : (
          <span className="flex-1 truncate py-0.5 select-none">{doc.title}</span>
        )}
        
        {!isRenaming && !isReaderMode && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 ml-2 shrink-0 animate-in slide-in-from-right-1 duration-150" onClick={e => e.stopPropagation()}>
            <button onClick={handleNewSubDoc} className="p-0.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-all cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setShowMenu(o => !o)} className="p-0.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-all cursor-pointer">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-2xl py-1 min-w-[150px] animate-in fade-in zoom-in-95 text-foreground">
                  <button onClick={() => { onRename(doc); setShowMenu(false); }} className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-[11px] font-bold hover:bg-accent text-foreground transition-all cursor-pointer">
                    <Edit3 className="w-3 h-3" /> Rename
                  </button>
                  <button onClick={() => { togglePin(doc.id); setShowMenu(false); }} className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-[11px] font-bold hover:bg-accent text-foreground transition-all cursor-pointer">
                    <Pin className="w-3 h-3 rotate-45" /> {doc.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button onClick={() => { toggleFavorite(doc.id); setShowMenu(false); }} className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-[11px] font-bold hover:bg-accent text-foreground transition-all cursor-pointer">
                    <Star className="w-3 h-3" /> {doc.isFavorite ? 'Unfavorite' : 'Favorite'}
                  </button>
                  <div className="border-t border-border mt-1 pt-1">
                    <button onClick={() => { deleteDocument(doc.id); setShowMenu(false); }} className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-[11px] font-bold hover:bg-rose-500/10 text-rose-500 cursor-pointer">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-0.5 mt-0.5">
              {childDocs.map(child => (
                <DocItem 
                  key={child.id} doc={child} allDocs={allDocs} 
                  onRename={onRename} renamingId={renamingId} renameVal={renameVal} 
                  setRenameVal={setRenameVal} commitRename={commitRename} 
                  level={level + 1} 
                  isReaderMode={isReaderMode}
                  onMobileClose={onMobileClose}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
