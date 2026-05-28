'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  ChevronRight,
  Plus,
  LogOut,
  ChevronDown,
  Palette,
  Briefcase,
  Users as Users2,
  Lock,
  Pin,
  Star,
  MoreVertical,
  Trash2,
  Pen as Edit3,
  FolderPlus,
  GraduationCap,
  ShieldAlert,
  Backpack,
  Code as Code2,
  BookOpen,
  X,
  Link2,
  AlertCircle,
  Send,
  FileText
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn, toSlug } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import { useProjectStore, getProjectSections } from '@/store/useProjectStore';
import { useDocumentStore, Doc } from '@/store/useDocumentStore';
import SettingsModal from './SettingsModal';
import ProjectModal from './ProjectModal';
import ShareModal from './ShareModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import { Select } from '@/components/ui/select';
import { getSectionIconSelectOptions, getSectionEmoji, SECTION_ICONS_MAP } from '@/lib/sectionIcons';

type ClientRole = string;

export default function Sidebar({
  mobileOpen = false,
  onMobileOpenChange,
}: {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const { projects, activeProjectId, setActiveProject, createProject, deleteProject, updateProject } = useProjectStore();
  const {
    documents, activeDocId, createDocument, deleteDocument,
    setActiveDoc, togglePin, toggleFavorite, updateDocument,
    fetchDocuments
  } = useDocumentStore();

  const [isCollapsed, setIsCollapsed] = useState(false);
  // isMobileOpen is now controlled externally via props; local state used as fallback
  const [isMobileOpenLocal, setIsMobileOpenLocal] = useState(false);
  const isMobileOpen = mobileOpen;
  const setIsMobileOpen = (val: boolean) => {
    setIsMobileOpenLocal(val);
    onMobileOpenChange?.(val);
  };
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [renameProjectVal, setRenameProjectVal] = useState('');
  const [openProjectMenuId, setOpenProjectMenuId] = useState<string | null>(null);
  const [shareProject, setShareProject] = useState<any>(null);

  // Delete Confirmation Modal states
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'section' | 'document';
    id: string;
    projectId?: string;
    title: string;
    message: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Track open/collapsed categories inside active project
  const [collapsedCategories, setCollapsedCategories] = useState<Record<ClientRole, boolean>>({
    teacher: false,
    admin: false,
    student: false,
    developer: false,
  });



  // Section edit states
  const [openSectionMenuId, setOpenSectionMenuId] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<{ projectId: string, sectionId: string, label: string, icon: string } | null>(null);

  const [isSectionsConfigOpen, setIsSectionsConfigOpen] = useState(false);
  const [selectedProjectForConfig, setSelectedProjectForConfig] = useState<any>(null);
  const [configCustomSections, setConfigCustomSections] = useState<Array<{ id: string; label: string; icon: string }>>([]);

  const handleOpenSectionsConfig = (project: any) => {
    setSelectedProjectForConfig(project);
    setConfigCustomSections(
      project.sections && project.sections.length > 0
        ? project.sections
        : [{ id: `sec_${Math.random().toString(36).slice(2, 7)}`, label: '', icon: 'BookOpen' }]
    );
    setIsSectionsConfigOpen(true);
  };

  const handleDeleteSection = (projectId: string, sectionId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    const section = (project.sections || []).find((s: any) => s.id === sectionId);
    const label = section?.label || 'this module';

    setDeleteTarget({
      type: 'section',
      id: sectionId,
      projectId,
      title: 'Delete Module',
      message: `Are you sure you want to delete the "${label}" module? ALL documents and sub-modules inside this module will be permanently deleted.`
    });
  };

  const handleDeleteDocClick = (id: string, title: string) => {
    setDeleteTarget({
      type: 'document',
      id,
      title: 'Delete Document',
      message: `Are you sure you want to delete "${title}"? This will also recursively delete all its nested sub-pages. This action cannot be undone.`
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'section') {
        const { projectId, id: sectionId } = deleteTarget;
        if (projectId) {
          const project = projects.find(p => p.id === projectId);
          if (project) {
            const updatedSections = (project.sections || []).filter((s: any) => s.id !== sectionId);
            await updateProject(projectId, { sections: updatedSections });
            await fetchDocuments();
          }
        }
      } else if (deleteTarget.type === 'document') {
        await deleteDocument(deleteTarget.id);
      }
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting target:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddConfigCustomSection = () => {
    const newId = `sec_${Math.random().toString(36).slice(2, 7)}`;
    setConfigCustomSections(prev => [...prev, { id: newId, label: '', icon: 'BookOpen' }]);
  };

  const handleRemoveConfigCustomSection = (id: string) => {
    setConfigCustomSections(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateConfigSectionLabel = (id: string, label: string) => {
    setConfigCustomSections(prev => prev.map(s => s.id === id ? { ...s, label } : s));
  };

  const handleUpdateConfigSectionIcon = (id: string, icon: string) => {
    setConfigCustomSections(prev => prev.map(s => s.id === id ? { ...s, icon } : s));
  };

  const handleSaveConfigSections = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectForConfig) return;
    const formatted = configCustomSections.map(s => ({
      id: s.id,
      label: s.label.trim(),
      icon: s.icon
    }));
    await updateProject(selectedProjectForConfig.id, { sections: formatted });
    await fetchDocuments();
    setIsSectionsConfigOpen(false);
    setSelectedProjectForConfig(null);
  };

  // 1. Detect if logged in user is Little Seeds Admin (Full edit rights)
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'admin';

  // 2. Project-wise Access: return all projects from the database
  const getAuthorizedProjects = () => {
    return projects;
  };

  const allowedProjects = getAuthorizedProjects();

  const activeProject = projects.find(p => p.id === activeProjectId);

  // Dynamic names mapping based on active project context
  const dynamicRoleMeta: Record<ClientRole, { label: string; icon: any; color: string }> = {
    teacher: {
      label: activeProject?.sectionLabels?.teacher ||
        (activeProjectId === 'p2' ? 'Coaches SOPs' : activeProjectId === 'p3' ? 'Merchant Manuals' : 'Teachers Manuals'),
      icon: GraduationCap,
      color: 'text-emerald-400',
    },
    admin: {
      label: activeProject?.sectionLabels?.admin ||
        (activeProjectId === 'p2' ? 'Platform Settings' : activeProjectId === 'p3' ? 'Warehouse Guidelines' : 'Admin Portal Setup'),
      icon: ShieldAlert,
      color: 'text-purple-400',
    },
    student: {
      label: activeProject?.sectionLabels?.student ||
        (activeProjectId === 'p2' ? 'Athlete Mobile Guide' : activeProjectId === 'p3' ? 'Customer Helpdesk' : 'Student & Parent Guides'),
      icon: Backpack,
      color: 'text-amber-400',
    },
    developer: {
      label: activeProject?.sectionLabels?.developer ||
        (activeProjectId === 'p2' ? 'WebSocket Sync API' : activeProjectId === 'p3' ? 'Headless API Specs' : 'Core Developer Specs'),
      icon: Code2,
      color: 'text-sky-400',
    },
  };

  const handleNewDoc = async (category: ClientRole, parentId?: string) => {
    if (!activeProjectId) return;
    const doc = await createDocument(parentId || null, activeProjectId, category);
    setActiveDoc(doc.id);
    startRename(doc);
    const proj = projects.find(p => p.id === activeProjectId);
    const sectionLabel = proj?.sections?.find(s => s.id === category)?.label || category;
    router.push(pathname.startsWith('/docs') ? `/docs/${toSlug(sectionLabel)}/${toSlug(doc.title)}` : `/dashboard/documents/${doc.id}`);
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

  const toggleCategory = (role: ClientRole) => {
    setCollapsedCategories(prev => ({ ...prev, [role]: !prev[role] }));
  };

  return (
    <>

      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar — single unified component: drawer on mobile, static on desktop */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-60 h-screen border-r border-sidebar-border bg-sidebar flex flex-col text-sidebar-foreground select-none transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none",
          // Mobile: slide in/out; Desktop: always visible
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed && !isMobileOpen ? "w-20" : "w-72"
        )}
      >
        {/* Little Seeds Branding Header */}
        <div className="p-4 flex flex-col shrink-0 gap-3 border-b border-border/20">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 px-1 py-1 w-full relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner bg-primary/10">
                <span className="text-xl">{activeProject?.icon || '🌱'}</span>
              </div>
              <div className="flex flex-col min-w-0 text-left flex-1">
                <span className="font-black text-lg text-foreground tracking-tight truncate">Little Seeds</span>
                {activeProject?.description ? (
                  <span className="text-[10px] text-muted-foreground font-medium mt-0.5 line-clamp-2 leading-tight">
                    {activeProject.description}
                  </span>
                ) : (
                  isAdmin && <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest leading-none mt-1">Docs Admin</span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Close button — visible only on mobile */}
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="lg:hidden p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  aria-label="Close navigation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-inner mx-auto cursor-pointer font-outfit font-black text-xl" onClick={() => setIsCollapsed(false)}>
              {activeProject?.icon || '🌱'}
            </div>
          )}
        </div>

        {/* Unified Project & Document Navigation Tree */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-thin">

          {/* Dashboard Link */}
          {isAdmin && (
            <div className="space-y-1">
              <Link href="/dashboard" onClick={() => setIsMobileOpen(false)}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group cursor-pointer text-sm font-bold uppercase tracking-wider",
                  pathname === '/dashboard' ? "bg-primary/10 text-primary font-extrabold" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}>
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>Dashboard</span>}
                </div>
              </Link>
            </div>
          )}

          {/* Active Project Documents (Modules) */}
          <div className="space-y-4">
            {!isCollapsed && !pathname.startsWith('/docs') && (
              <div className="flex items-center justify-between px-3 mb-2">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Module Directories
                </p>
                {isAdmin && (
                  <button
                    onClick={() => {
                      const proj = activeProject || allowedProjects[0];
                      if (proj) handleOpenSectionsConfig(proj);
                    }}
                    className="p-1 hover:bg-primary/10 bg-card border border-border shadow-xs rounded-md text-primary transition-all cursor-pointer"
                    title="Configure Modules"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            <div className="space-y-3">
              {(() => {
                const project = activeProject || allowedProjects[0];
                if (!project) return (
                  <div className="px-3 py-4 text-center">
                    <p className="text-[10px] text-muted-foreground italic">No workspace found.</p>
                  </div>
                );

                const isPublicDocsPage = pathname.startsWith('/docs');

                const projDocs = documents.filter(d =>
                  d.projectId === project.id &&
                  (isAdmin && !isPublicDocsPage ? true : d.status === 'published')
                );

                return (
                  <div className="flex flex-col relative group/module">
                    {!isCollapsed && (
                      <div className="px-3 pb-3 space-y-4 select-none animate-in fade-in duration-200">
                        {getProjectSections(project).length === 0 && (
                          <div className="py-4 text-center px-2 border border-dashed border-border rounded-xl bg-accent/10">
                            <p className="text-[10px] text-muted-foreground italic font-semibold leading-relaxed">No modules configured</p>
                            {isAdmin && (
                              <button
                                onClick={() => handleOpenSectionsConfig(project)}
                                className="mt-2 text-[9px] font-black uppercase tracking-wider text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
                              >
                                <Plus className="w-3 h-3" /> Add Module
                              </button>
                            )}
                          </div>
                        )}
                        {getProjectSections(project).map(section => {
                          const role = section.id;
                          const IconName = section.icon || 'BookOpen';
                          const resolvedIconKey = IconName as keyof typeof LucideIcons;
                          const Icon = (SECTION_ICONS_MAP[IconName] || LucideIcons[resolvedIconKey] || LucideIcons.BookOpen) as React.ElementType;

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

                          const isCatCollapsed = collapsedCategories[role] ?? false;

                          const catDocs = projDocs.filter(d => d.category === role);
                          
                          // Hide completely on public docs page if there are no published documents
                          if (isPublicDocsPage && catDocs.length === 0) {
                            return null;
                          }

                          const rootDocs = catDocs.filter(d => !d.parentId);

                          return (
                            <div key={role} className="space-y-1.5 pt-2 border-b border-border/5 pb-2 last:border-0">

                              {/* Category header */}
                              <div className="flex items-center justify-between group/cat">
                                <button
                                  onClick={() => toggleCategory(role)}
                                  className="flex items-center gap-2 text-left hover:text-foreground transition-colors cursor-pointer"
                                >
                                  {isCatCollapsed ? (
                                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                                  )}
                                  <Icon className={cn("w-5 h-5 shrink-0", meta.color)} />
                                  <span className="text-xs font-black uppercase tracking-wider text-muted-foreground font-outfit mt-px">
                                    {meta.label}
                                  </span>
                                </button>

                                {/* Inline creators ONLY for Little Seeds Admin */}
                                {isAdmin && (
                                  <div className="flex items-center gap-1 opacity-0 group-hover/cat:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                    {!isPublicDocsPage && (
                                      <button
                                        onClick={() => {
                                          if (project.id !== activeProjectId) {
                                            setActiveProject(project.id);
                                          }
                                          handleNewDoc(role);
                                        }}
                                        className="p-0.5 hover:bg-accent rounded text-primary transition-all cursor-pointer"
                                        title="Add manual"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    )}

                                    {/* 3-dots menu for Section */}
                                    {!isPublicDocsPage && (
                                      <div className="relative flex items-center justify-center">
                                      <button
                                        onClick={() => {
                                          setOpenSectionMenuId(openSectionMenuId === `${project.id}_${role}` ? null : `${project.id}_${role}`);
                                        }}
                                        className="p-0.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                                        title="Section settings"
                                      >
                                        <MoreVertical className="w-3 h-3" />
                                      </button>

                                        {openSectionMenuId === `${project.id}_${role}` && (
                                        <>
                                          <div className="fixed inset-0 z-40" onClick={() => setOpenSectionMenuId(null)} />
                                          <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-2xl py-1 min-w-[130px] animate-in fade-in zoom-in-95 text-foreground text-left">
                                            <button
                                              onClick={() => {
                                                setEditingSection({ projectId: project.id, sectionId: role, label: section.label, icon: section.icon || 'BookOpen' });
                                                setOpenSectionMenuId(null);
                                              }}
                                              className="flex items-center gap-2 w-full text-left px-3 py-2 text-[10px] font-bold hover:bg-accent text-primary transition-all cursor-pointer border-b border-border/40 pb-2"
                                            >
                                              <Edit3 className="w-3 h-3 text-primary" /> Edit Section
                                            </button>
                                            <button
                                              onClick={() => {
                                                handleDeleteSection(project.id, role);
                                                setOpenSectionMenuId(null);
                                              }}
                                              className="flex items-center gap-2 w-full text-left px-3 py-2 text-[10px] font-bold hover:bg-rose-500/10 text-rose-500 cursor-pointer mt-1"
                                            >
                                              <Trash2 className="w-3 h-3" /> Delete
                                            </button>
                                          </div>
                                        </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Document links */}
                              {!isCatCollapsed && (
                                <div className="pl-3 space-y-1">
                                  {rootDocs.map(doc => (
                                    <DocLinkItem
                                      key={doc.id} doc={doc} activeDocId={activeDocId}
                                      isAdmin={isAdmin} activeStyles={meta.color}
                                      allDocs={catDocs} onRename={startRename}
                                      renamingId={renamingId} renameVal={renameVal}
                                      setRenameVal={setRenameVal} commitRename={commitRename}
                                      onDeleteDocument={handleDeleteDocClick} togglePin={togglePin}
                                      toggleFavorite={toggleFavorite} handleSelect={() => {
                                        setActiveDoc(doc.id);
                                        setIsMobileOpen(false);
                                        router.push(pathname.startsWith('/docs') ? `/docs/${toSlug(meta.label)}/${toSlug(doc.title)}` : `/dashboard/documents/${doc.id}`);
                                      }}
                                      handleNewSubDoc={() => handleNewDoc(role, doc.id)}
                                    />
                                  ))}

                                  {/* Empty state notice */}
                                  {rootDocs.length === 0 && (
                                    <div className="pl-3 py-2 text-left select-none animate-in fade-in duration-200">
                                      <p className="text-xs text-muted-foreground italic font-semibold">No manuals created yet</p>
                                      {isAdmin && (
                                        <button
                                          onClick={() => {
                                            if (project.id !== activeProjectId) {
                                              setActiveProject(project.id);
                                            }
                                            handleNewDoc(role);
                                          }}
                                          className="mt-1 text-[11px] font-black uppercase tracking-wider text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer"
                                        >
                                          <Plus className="w-3 h-3" /> Create First Manual
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

        </div>

        {/* Sidebar Footer */}
        <div className="p-3 mt-auto space-y-1 bg-background border-t border-border">
          {user ? (
            <div className={cn(
              "flex items-center gap-3 p-2 rounded-lg transition-all group relative text-left",
              !isCollapsed && "hover:bg-accent cursor-pointer",
              isCollapsed && "justify-center"
            )}>
              <Avatar className="w-8 h-8 border border-border shadow-sm">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-foreground leading-none">{user?.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate uppercase font-black tracking-widest mt-1.5">
                    {isAdmin ? 'Little Seeds Admin' : 'Client Reader'}
                  </p>
                </div>
              )}
              {!isCollapsed && (
                <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={logout}>
                  <LogOut className="w-3.5 h-3.5 text-rose-500 hover:text-rose-600 cursor-pointer" />
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>


      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />



      {/* Share Module Modal */}
      {shareProject && (
        <ShareModal
          project={shareProject}
          onClose={() => setShareProject(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        title={deleteTarget?.title || ''}
        message={deleteTarget?.message || ''}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />

      {/* Sections Config Overlay Modal */}
      {isSectionsConfigOpen && selectedProjectForConfig && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-4 select-none animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-card border border-border/80 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden ring-1 ring-border/50">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 pb-2 shrink-0 relative z-10 bg-card">
              <button
                onClick={() => {
                  setIsSectionsConfigOpen(false);
                  setSelectedProjectForConfig(null);
                }}
                className="absolute right-4 top-4 text-muted-foreground hover:bg-accent p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-xl font-black text-foreground font-outfit uppercase tracking-tight">Configure Modules</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1 pr-6 leading-relaxed">
                Manage workspace sections for <span className="text-foreground">{selectedProjectForConfig.name}</span>
              </p>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveConfigSections} className="p-5 sm:p-6 pt-3 flex flex-col gap-5 overflow-hidden">
              
              {/* Sections Container */}
              <div className="bg-accent/10 border border-border rounded-2xl flex flex-col shadow-inner overflow-hidden">
                
                {/* Sections List Header (Sticky) */}
                <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-border/60 bg-accent/40 shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Custom Sections</span>
                  <button
                    type="button"
                    onClick={handleAddConfigCustomSection}
                    className="text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 cursor-pointer bg-primary/10 hover:bg-primary/20 px-2.5 py-1.5 rounded-lg"
                  >
                    <Plus className="w-3 h-3" /> Add Section
                  </button>
                </div>

                {/* Sections List Scrollable Area */}
                <div className="p-3.5 sm:p-4 overflow-y-auto scrollbar-thin space-y-3.5 max-h-[45vh] sm:max-h-[350px]">
                  {configCustomSections.map((section, idx) => (
                    <div key={section.id} className="flex flex-col gap-3 bg-card border border-border/80 p-3.5 rounded-xl hover:border-primary/40 shadow-xs hover:shadow-md transition-all group/item">
                      <div className="relative w-full">
                        <Select
                          value={section.icon}
                          onChange={val => handleUpdateConfigSectionIcon(section.id, val)}
                          options={getSectionIconSelectOptions()}
                          className="w-full"
                          triggerClassName="h-10 px-3 rounded-lg bg-accent/30 border-border/60 hover:border-border transition-colors text-sm font-semibold"
                        />
                      </div>

                      <div className="flex w-full items-center gap-2.5">
                        <input
                          type="text"
                          required
                          value={section.label}
                          onChange={e => handleUpdateConfigSectionLabel(section.id, e.target.value)}
                          placeholder={`Section ${idx + 1} name...`}
                          className="flex-1 min-w-0 bg-background border border-border/80 hover:border-border focus:border-primary/40 focus:bg-background rounded-lg px-3.5 h-10 text-sm font-bold text-foreground focus:outline-none transition-all placeholder:text-muted-foreground/40 shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveConfigCustomSection(section.id)}
                          className="bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-rose-500 hover:text-rose-600 transition-colors shrink-0 cursor-pointer flex items-center justify-center h-10 w-10 shadow-xs"
                          title="Remove custom section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Empty State */}
                  {configCustomSections.length === 0 && (
                    <div className="py-8 sm:py-10 text-center bg-card rounded-xl border border-dashed border-border/60 flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mb-1">
                        <BookOpen className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">No custom sections</p>
                      <p className="text-[10px] font-bold text-muted-foreground/70">Click Add Section above to create one.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsSectionsConfigOpen(false);
                    setSelectedProjectForConfig(null);
                  }}
                  className="flex-1 h-12 rounded-xl border border-border/80 text-xs font-bold text-foreground/80 hover:text-foreground hover:bg-accent transition-all cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20 transition-all cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md space-y-6 text-left shadow-2xl relative">
            <button
              onClick={() => setEditingSection(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-foreground font-outfit uppercase tracking-wider">Edit Section</h3>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Modify section name and icon</p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const { projectId, sectionId, label, icon } = editingSection;
                const project = projects.find(p => p.id === projectId);
                if (!project) return;

                const updatedSections = (project.sections || []).map((s: any) =>
                  s.id === sectionId ? { ...s, label: label.trim(), icon } : s
                );

                await updateProject(projectId, { sections: updatedSections });
                setEditingSection(null);
              }}
              className="space-y-5"
            >
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Section Name</label>
                  <input
                    type="text"
                    required
                    value={editingSection.label}
                    onChange={e => setEditingSection(prev => prev ? { ...prev, label: e.target.value } : null)}
                    placeholder="Enter section name..."
                    className="w-full bg-background border border-border hover:border-border/80 focus:border-primary/45 focus:bg-background rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none transition-all placeholder:text-muted-foreground/45"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Section Icon</label>
                  <Select
                    value={editingSection.icon}
                    onChange={val => setEditingSection(prev => prev ? { ...prev, icon: val } : null)}
                    options={getSectionIconSelectOptions()}
                    className="w-full"
                    triggerClassName="h-10 px-3 rounded-xl text-xs font-bold bg-background border border-border"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="flex-1 h-11 rounded-xl border border-border text-xs font-bold hover:bg-accent transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/10 transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
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
    </>
  );
}

interface DocLinkProps {
  doc: Doc; activeDocId: string | null; isAdmin: boolean; activeStyles: string;
  allDocs: Doc[]; renamingId: string | null; renameVal: string;
  setRenameVal: (v: string) => void; commitRename: () => void;
  onDeleteDocument: (id: string, title: string) => void; togglePin: (id: string) => void;
  toggleFavorite: (id: string) => void; onRename: (doc: Doc) => void;
  handleSelect: () => void; handleNewSubDoc: () => void;
  level?: number;
}

function DocLinkItem({
  doc, activeDocId, isAdmin, activeStyles, allDocs, renamingId, renameVal,
  setRenameVal, commitRename, onDeleteDocument, togglePin, toggleFavorite, onRename,
  handleSelect, handleNewSubDoc, level = 0
}: DocLinkProps) {
  const [showMenu, setShowMenu] = useState(false);
  const pathname = usePathname() || '';
  const active = doc.id === activeDocId;
  const isRenaming = renamingId === doc.id;

  const childDocs = allDocs.filter(d => d.parentId === doc.id);
  const hasChildren = childDocs.length > 0;

  const activeLinkStyle = activeStyles.replace('text-', 'text-');

  return (
    <div className="space-y-0.5 mt-0.5">
      <div
        className={cn(
          'group flex items-center justify-between py-1.5 px-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer relative',
          active
            ? `${pathname.startsWith('/docs') ? 'text-primary font-bold' : 'bg-primary/10 text-primary font-bold'}`
            : `text-sidebar-foreground/60 hover:text-sidebar-foreground ${pathname.startsWith('/docs') ? '' : 'hover:bg-sidebar-accent'}`
        )}
        style={{ paddingLeft: `${10 + level * 12}px` }}
        onClick={handleSelect}
      >
        {isRenaming ? (
          <input
            autoFocus
            value={renameVal}
            onChange={e => setRenameVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') commitRename(); }}
            onBlur={commitRename}
            onClick={e => e.stopPropagation()}
            className="flex-1 bg-transparent border-b border-primary/50 text-sm font-bold focus:outline-none min-w-0 py-0.5 text-foreground"
          />
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {doc.emoji ? (
              <span className="text-sm shrink-0 select-none">{doc.emoji}</span>
            ) : (
              <FileText className="w-3.5 h-3.5 shrink-0 text-muted-foreground/60 group-hover:text-sidebar-foreground transition-colors" />
            )}
            <span className="flex-1 truncate select-none text-sm">{doc.title}</span>
          </div>
        )}

        {!isRenaming && isAdmin && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 ml-2 shrink-0" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowMenu(o => !o)} className="p-0.5 hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-all">
              <MoreVertical className="w-3 h-3" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-xl shadow-2xl py-1 min-w-[130px] text-popover-foreground">
                  <button onClick={() => { onRename(doc); setShowMenu(false); }} className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-accent text-foreground transition-all">
                    <Edit3 className="w-3 h-3" /> Rename
                  </button>
                  <button onClick={() => { togglePin(doc.id); setShowMenu(false); }} className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-accent text-foreground transition-all">
                    <Pin className="w-3 h-3 rotate-45" /> {doc.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button onClick={() => { toggleFavorite(doc.id); setShowMenu(false); }} className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-accent text-foreground transition-all">
                    <Star className="w-3 h-3" /> {doc.isFavorite ? 'Unfavorite' : 'Favorite'}
                  </button>
                  <div className="border-t border-border/30 mt-1 pt-1">
                    <button onClick={() => { onDeleteDocument(doc.id, doc.title); setShowMenu(false); }} className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-[10px] font-bold hover:bg-rose-500/10 text-rose-500">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {hasChildren && (
        <div className="space-y-0.5">
          {childDocs.map(child => (
            <DocLinkItem
              key={child.id} doc={child} activeDocId={activeDocId}
              isAdmin={isAdmin} activeStyles={activeStyles}
              allDocs={allDocs} onRename={onRename}
              renamingId={renamingId} renameVal={renameVal}
              setRenameVal={setRenameVal} commitRename={commitRename}
              onDeleteDocument={onDeleteDocument} togglePin={togglePin}
              toggleFavorite={toggleFavorite} handleSelect={() => {
                handleSelect();
              }}
              handleNewSubDoc={handleNewSubDoc}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
