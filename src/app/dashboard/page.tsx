'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  Activity,
  BookOpen,
  Code as Code2,
  ChevronRight,
  GraduationCap,
  Backpack,
  Compass,
  Sparkles,
  ShieldAlert,
  Briefcase,
  Users as Users2,
  Pin,
  FolderPlus,
  FilePlus,
  Globe,
  ArrowUpRight,
  Layout,
  Trash2,
  Edit3,
  Save,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProjectStore } from '@/store/useProjectStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAuthStore } from '@/store/useAuthStore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import DeleteConfirmModal from '@/components/shared/DeleteConfirmModal';

export default function DashboardPage() {
  const router = useRouter();
  const { projects, setActiveProject, updateProject } = useProjectStore();
  const { documents, setActiveDoc, togglePin, createDocument, updateDocument, deleteDocument } = useDocumentStore();
  const { user } = useAuthStore();

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'admin';

  // Get the default Little Seeds platform project context
  const project = projects[0];

  const getAuthorizedCategories = () => {
    const base = ['teacher', 'admin', 'student', 'developer'];
    const customIds = project?.sections?.map(s => s.id) || [];
    return Array.from(new Set([...base, ...customIds]));
  };

  const allowedCategories = getAuthorizedCategories();

  const allowedDocs = documents.filter(d =>
    (project ? d.projectId === project.id : true) &&
    allowedCategories.includes(d.category) &&
    (isAdmin ? true : d.status === 'published')
  );

  const pinnedDocs = allowedDocs.filter(d => d.isPinned);
  const recentDocs = [...allowedDocs].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 10);

  const totalDocsCount = allowedDocs.length;
  const publishedDocsCount = allowedDocs.filter(d => d.status === 'published' || !d.status).length;
  const draftDocsCount = allowedDocs.filter(d => d.status === 'draft').length;

  const allSections = project?.sections || [];
  const totalSectionsCount = allSections.length;

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'teacher': return 'Staff SOPs';
      case 'admin': return 'Admin Controls';
      case 'student': return 'Client Guides';
      case 'developer': return 'Dev specs';
      default: {
        const section = allSections.find(s => s.id === category);
        return section ? `${section.label}` : category;
      }
    }
  };

  const handleOpenDoc = (docId: string) => {
    if (project) setActiveProject(project.id);
    setActiveDoc(docId);
    router.push(`/dashboard/documents/${docId}`);
  };

  const [newModuleName, setNewModuleName] = React.useState('');
  const [newDocName, setNewDocName] = React.useState('');
  const [selectedModuleForDoc, setSelectedModuleForDoc] = React.useState('');

  const [editingModuleId, setEditingModuleId] = React.useState<string | null>(null);
  const [editModuleLabel, setEditModuleLabel] = React.useState('');
  const [editingDocId, setEditingDocId] = React.useState<string | null>(null);
  const [editDocTitle, setEditDocTitle] = React.useState('');

  const [openModules, setOpenModules] = React.useState<Record<string, boolean>>({});
  const toggleModule = (moduleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOpenModules(prev => ({ ...prev, [moduleId]: prev[moduleId] === undefined ? false : !prev[moduleId] }));
  };

  const [deleteModalState, setDeleteModalState] = React.useState<{
    isOpen: boolean;
    type: 'module' | 'doc' | null;
    id: string | null;
  }>({ isOpen: false, type: null, id: null });

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim() || !project) return;
    const newId = `sec_${Math.random().toString(36).slice(2, 7)}`;
    const newSection = { id: newId, label: newModuleName.trim(), icon: 'BookOpen' };
    await updateProject(project.id, { sections: [...(project.sections || []), newSection] });
    setNewModuleName('');
  };

  const handleDeleteModule = (moduleId: string) => {
    setDeleteModalState({ isOpen: true, type: 'module', id: moduleId });
  };

  const handleSaveModule = async (moduleId: string) => {
    if (!editModuleLabel.trim()) return;
    const updatedSections = (project?.sections || []).map(s => s.id === moduleId ? { ...s, label: editModuleLabel.trim() } : s);
    await updateProject(project.id, { sections: updatedSections });
    setEditingModuleId(null);
  };

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim() || !selectedModuleForDoc || !project) return;
    const doc = await createDocument(null, project.id, selectedModuleForDoc);
    await updateDocument(doc.id, { title: newDocName.trim() });
    setActiveDoc(doc.id);
    router.push(`/dashboard/documents/${doc.id}`);
  };

  const handleSaveDoc = async (docId: string) => {
    if (!editDocTitle.trim()) return;
    await updateDocument(docId, { title: editDocTitle.trim() });
    setEditingDocId(null);
  };

  const handleDeleteDoc = (docId: string) => {
    setDeleteModalState({ isOpen: true, type: 'doc', id: docId });
  };

  const confirmDelete = async () => {
    if (!deleteModalState.id || !deleteModalState.type) return;

    if (deleteModalState.type === 'module' && project) {
      const updatedSections = (project.sections || []).filter(s => s.id !== deleteModalState.id);
      await updateProject(project.id, { sections: updatedSections });
    } else if (deleteModalState.type === 'doc') {
      await deleteDocument(deleteModalState.id);
    }
    
    setDeleteModalState({ isOpen: false, type: null, id: null });
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto font-inter text-slate-700 dark:text-slate-300">

      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md border border-border/40 overflow-hidden shrink-0">
            <img src="/ls-image.png" alt="Little Seeds" className="w-full h-full object-contain p-1.5" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 font-outfit">
              Little Seeds
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-extrabold text-primary uppercase tracking-widest mr-2">Rooted in Faith</span>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10 font-bold uppercase tracking-wider text-[9px]">
                All Systems Operational
              </Badge>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Admin Console
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/docs">
            <Button variant="outline" className="rounded-xl border-border/60 hover:bg-accent text-xs font-bold gap-2 h-11 px-5 shadow-xs transition-all">
              <Globe className="w-4 h-4 text-muted-foreground" />
              View Public Portal
              <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
          Documentation Health Metrics
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { title: "Total Manuals", value: totalDocsCount, desc: "All created documents", icon: BookOpen, color: "text-primary bg-primary/10" },
            { title: "Published Manuals", value: publishedDocsCount, desc: "Live client & staff guides", icon: FileText, color: "text-emerald-500 bg-emerald-500/10" },
            { title: "Drafts & Revisions", value: draftDocsCount, desc: "In-progress revisions", icon: Activity, color: "text-amber-500 bg-amber-500/10" },
            { title: "Configured Modules", value: totalSectionsCount, desc: "Custom documentation sections", icon: Compass, color: "text-sky-500 bg-sky-500/10" }
          ].map((stat, i) => (
            <Card key={i} className="bg-card border-border/40 hover:border-primary/30 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-5 flex items-center justify-between relative z-10">
                <div className="space-y-1 text-left">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">{stat.value}</h3>
                  <p className="text-[10px] font-semibold text-slate-400">{stat.desc}</p>
                </div>
                <div className={cn("p-3 rounded-2xl shrink-0 shadow-inner border border-white/10", stat.color)}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Dashboard Interactive Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left/Main Column: Pinned & Recent Docs (Span 2) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Section: Pinned Documents */}
          {pinnedDocs.length > 0 && (
            <div className="space-y-5">
              <div className="text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-outfit flex items-center gap-2">
                  <Pin className="w-5 h-5 text-primary" /> Pinned Documents
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Quick access to important manuals</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pinnedDocs.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => handleOpenDoc(doc.id)}
                    className="bg-card border border-border/40 hover:border-primary/50 transition-all rounded-xl p-4 cursor-pointer group shadow-xs hover:shadow-md text-left flex items-start gap-3 relative overflow-hidden"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-lg shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                      {doc.emoji || '📄'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-sm mb-0.5 group-hover:text-primary transition-colors text-slate-900 dark:text-slate-100 truncate pr-4">
                        {doc.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider flex-wrap mt-1.5">
                        <span className="text-primary truncate max-w-[120px]">{getCategoryLabel(doc.category)}</span>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 z-20">
                      {isAdmin ? (
                        <button
                          onClick={e => { e.stopPropagation(); togglePin(doc.id); }}
                          className="p-1.5 rounded-md hover:bg-primary/10 text-primary opacity-50 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Unpin Document"
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <Pin className="w-3.5 h-3.5 text-primary opacity-50 group-hover:opacity-100 transition-opacity m-1.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Knowledge Base Content Manager */}
          <div className="space-y-5 pt-2">
            <div className="text-left flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-outfit flex items-center gap-2">
                  <Layout className="w-5 h-5 text-primary" /> Content Manager
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Manage your modules and manuals</p>
              </div>
            </div>
            
            <div className="space-y-4 max-h-[70vh] overflow-y-auto p-4 pr-2 pb-4 border border-border/50 shadow-sm rounded-2xl bg-card scrollbar-thin">
              {allSections.map(section => {
                const sectionDocs = allowedDocs.filter(d => d.category === section.id);
                const isModuleOpen = openModules[section.id] !== false;
                
                return (
                  <Card key={section.id} className="bg-card border-border/50 shadow-xs hover:shadow-md transition-shadow overflow-hidden group/card">
                    <CardHeader 
                      className="p-3.5 sm:p-4 bg-transparent border-b border-border/50 flex flex-row items-center justify-between space-y-0 cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                      onClick={() => !editingModuleId && toggleModule(section.id)}
                    >
                      {editingModuleId === section.id ? (
                        <div className="flex items-center gap-2 flex-1 mr-4" onClick={e => e.stopPropagation()}>
                          <input 
                            value={editModuleLabel}
                            onChange={e => setEditModuleLabel(e.target.value)}
                            className="flex-1 bg-background border border-primary/40 rounded-lg px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground shadow-inner"
                            autoFocus
                          />
                          <Button onClick={(e) => { e.stopPropagation(); handleSaveModule(section.id); }} size="sm" className="h-9 px-3.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"><Save className="w-4 h-4 mr-1"/> Save</Button>
                          <Button onClick={(e) => { e.stopPropagation(); setEditingModuleId(null); }} variant="ghost" size="sm" className="h-9 px-3 rounded-lg text-slate-500">Cancel</Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", isModuleOpen ? "" : "-rotate-90")} />
                          <CardTitle className="text-sm font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2.5">
                            <div className="p-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 shadow-inner">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            {section.label}
                          </CardTitle>
                        </div>
                      )}
                      
                      {!editingModuleId && isAdmin && (
                        <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <Button onClick={(e) => { e.stopPropagation(); setEditingModuleId(section.id); setEditModuleLabel(section.label); }} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10"><Edit3 className="w-4 h-4"/></Button>
                          <Button onClick={(e) => { e.stopPropagation(); handleDeleteModule(section.id); }} variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"><Trash2 className="w-4 h-4"/></Button>
                        </div>
                      )}
                    </CardHeader>
                    
                    {isModuleOpen && (
                      <CardContent className="p-0 bg-background animate-in fade-in slide-in-from-top-2 duration-200">
                      {sectionDocs.length === 0 ? (
                        <div className="p-6 text-center flex flex-col items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                             <FileText className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Manuals Created</span>
                        </div>
                      ) : (
                        <div className="divide-y divide-border/40">
                          {sectionDocs.map(doc => (
                            <div key={doc.id} className="p-3 sm:px-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors group">
                              {editingDocId === doc.id ? (
                                <div className="flex items-center gap-2 flex-1 mr-4">
                                  <input 
                                    value={editDocTitle}
                                    onChange={e => setEditDocTitle(e.target.value)}
                                    className="flex-1 bg-background border border-primary/40 rounded-md px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground shadow-inner"
                                    autoFocus
                                  />
                                  <Button onClick={() => handleSaveDoc(doc.id)} size="sm" className="h-8 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"><Save className="w-3.5 h-3.5 mr-1"/> Save</Button>
                                  <Button onClick={() => setEditingDocId(null)} variant="ghost" size="sm" className="h-8 px-2 rounded-md text-xs text-slate-500">Cancel</Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3 min-w-0 cursor-pointer flex-1" onClick={() => handleOpenDoc(doc.id)}>
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-border/60 flex items-center justify-center text-sm shrink-0 shadow-inner group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                                    {doc.emoji || '📄'}
                                  </div>
                                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors truncate">{doc.title}</span>
                                </div>
                              )}
                              
                              {!editingDocId && (
                                <div className="flex items-center gap-3 shrink-0 ml-2">
                                  {doc.status && (
                                    <Badge className={cn(
                                      "font-black text-[9px] uppercase px-2 py-0.5 rounded-md border tracking-widest shadow-sm",
                                      doc.status === 'published' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                                    )}>
                                      {doc.status}
                                    </Badge>
                                  )}
                                  {isAdmin && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button onClick={(e) => { e.stopPropagation(); setEditingDocId(doc.id); setEditDocTitle(doc.title); }} variant="ghost" size="icon" className="h-7 w-7 rounded-md text-slate-400 hover:text-primary hover:bg-primary/10"><Edit3 className="w-3.5 h-3.5"/></Button>
                                      <Button onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc.id); }} variant="ghost" size="icon" className="h-7 w-7 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"><Trash2 className="w-3.5 h-3.5"/></Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
              {allSections.length === 0 && (
                <div className="p-8 text-center bg-card border border-dashed border-border/60 rounded-xl">
                  <FolderPlus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No Modules Configured</p>
                  <p className="text-[10px] text-slate-400 mt-1">Use Quick Actions to create your first module.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Section Directory insights & Sim Panel (Span 1) */}
        <div className="space-y-8">

          {/* Quick Actions Panel */}
          {isAdmin && (
            <div className="space-y-4">
              <h2 className="text-sm font-black flex items-center gap-2 text-slate-900 dark:text-slate-200 uppercase tracking-widest font-outfit text-left">
                <Sparkles className="w-4 h-4 text-primary shrink-0" /> Quick Actions
              </h2>
              <Card className="bg-card border-border/50 shadow-md text-left overflow-hidden">
                <CardContent className="p-0">
                  
                  {/* Create Module */}
                  <div className="p-5 border-b border-border/50 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-900/30 transition-colors">
                    <form onSubmit={handleCreateModule} className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <FolderPlus className="w-4 h-4 text-primary" /> Create New Module
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <input 
                          value={newModuleName}
                          onChange={e => setNewModuleName(e.target.value)}
                          placeholder="e.g. HR Policies" 
                          className="flex-1 w-full bg-background border border-border/80 hover:border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all shadow-inner"
                        />
                        <Button type="submit" disabled={!newModuleName.trim()} size="sm" className="w-full sm:w-auto rounded-xl px-5 py-3 sm:py-2 h-auto bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 font-black tracking-widest uppercase text-[10px] shadow-lg shadow-primary/20">
                          Add Module
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* Create Document */}
                  <div className="p-5 bg-gradient-to-t from-slate-50/50 to-transparent dark:from-slate-900/30 transition-colors">
                    <form onSubmit={handleCreateDoc} className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <FilePlus className="w-4 h-4 text-primary" /> Draft New Manual
                      </label>
                      <div className="space-y-3">
                        <div className="relative">
                          <select 
                            value={selectedModuleForDoc}
                            onChange={e => setSelectedModuleForDoc(e.target.value)}
                            className="w-full bg-background border border-border/80 hover:border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all shadow-inner appearance-none cursor-pointer"
                          >
                            <option value="" disabled>Select parent module...</option>
                            {allSections.map(s => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                          </select>
                          <ChevronRight className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <input 
                            value={newDocName}
                            onChange={e => setNewDocName(e.target.value)}
                            placeholder="Document title..." 
                            className="flex-1 w-full bg-background border border-border/80 hover:border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground transition-all shadow-inner"
                          />
                          <Button type="submit" disabled={!newDocName.trim() || !selectedModuleForDoc} size="sm" className="w-full sm:w-auto rounded-xl px-5 py-3 sm:py-2 h-auto bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 font-black tracking-widest uppercase text-[10px] shadow-lg shadow-primary/20">
                            Draft Manual
                          </Button>
                        </div>
                      </div>
                    </form>
                  </div>

                </CardContent>
              </Card>
            </div>
          )}

          {/* Section: Recent Documentation Operations */}
          <div className="space-y-4">
            <div className="text-left flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black flex items-center gap-2 text-slate-900 dark:text-slate-200 uppercase tracking-widest font-outfit text-left">
                  <Activity className="w-4 h-4 text-primary shrink-0" /> Audit Log
                </h2>
              </div>
            </div>

            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-md max-h-[400px] overflow-y-auto scrollbar-thin">
              {recentDocs.map((doc, i) => (
                <div
                  key={doc.id}
                  onClick={() => handleOpenDoc(doc.id)}
                  className={cn(
                    "flex flex-col p-4 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group cursor-pointer text-left",
                    i !== recentDocs.length - 1 && "border-b border-border/40"
                  )}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-border/60 flex items-center justify-center text-sm shadow-inner shrink-0 select-none group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                      {doc.emoji || '📄'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-sm mb-1 group-hover:text-primary transition-colors text-slate-800 dark:text-slate-200 truncate">
                        {doc.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider flex-wrap">
                        <span className="text-primary">{getCategoryLabel(doc.category)}</span>
                        <span className="text-slate-300 dark:text-slate-700 font-bold select-none hidden sm:inline">•</span>
                        <span className="text-slate-400 font-bold">{format(new Date(doc.updatedAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {recentDocs.length === 0 && (
                <div className="p-8 text-center">
                  <Compass className="w-8 h-8 text-slate-650 mx-auto mb-2" />
                  <p className="text-[10px] text-slate-500 italic">No activity yet.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        title={deleteModalState.type === 'module' ? 'Delete Module' : 'Delete Manual'}
        message={
          deleteModalState.type === 'module'
            ? 'Are you sure you want to delete this module? This action cannot be undone.'
            : 'Are you sure you want to delete this manual? This action cannot be undone.'
        }
        onConfirm={confirmDelete}
        onClose={() => setDeleteModalState({ isOpen: false, type: null, id: null })}
      />
    </div>
  );
}
