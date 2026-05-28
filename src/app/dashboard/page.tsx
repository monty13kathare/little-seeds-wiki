'use client';

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
  Pin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProjectStore } from '@/store/useProjectStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useAuthStore } from '@/store/useAuthStore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { projects, setActiveProject } = useProjectStore();
  const { documents, setActiveDoc, togglePin } = useDocumentStore();
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

  const sectionMetrics = (() => {
    const list: Array<{ id: string; label: string; icon: string; count: number; percentage: number }> = [];
    allSections.forEach(s => {
      const count = allowedDocs.filter(d => d.category === s.id).length;
      list.push({
        id: s.id,
        label: s.label,
        icon: s.icon || 'BookOpen',
        count,
        percentage: allowedDocs.length > 0 ? Math.round((count / allowedDocs.length) * 100) : 0
      });
    });
    return list.sort((a, b) => b.count - a.count);
  })();

  return (
    <div className="p-6 md:p-8 space-y-10 max-w-7xl mx-auto font-inter text-slate-700 dark:text-slate-300">

      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
          Documentation Analytics
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { title: "Total Manuals", value: totalDocsCount, desc: "All created documents", icon: BookOpen, color: "text-primary bg-primary/10" },
            { title: "Published Manuals", value: publishedDocsCount, desc: "Live client & staff guides", icon: FileText, color: "text-emerald-500 bg-emerald-500/10" },
            { title: "Drafts & Revisions", value: draftDocsCount, desc: "In-progress revisions", icon: Activity, color: "text-amber-500 bg-amber-500/10" },
            { title: "Configured Modules", value: totalSectionsCount, desc: "Custom documentation sections", icon: Compass, color: "text-sky-500 bg-sky-500/10" }
          ].map((stat, i) => (
            <Card key={i} className="bg-card border-border/40 hover:border-primary/20 hover:shadow-md transition-all duration-300 overflow-hidden relative">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1 text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.title}</p>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">{stat.value}</h3>
                  <p className="text-[10px] font-semibold text-slate-500">{stat.desc}</p>
                </div>
                <div className={cn("p-3 rounded-2xl shrink-0", stat.color)}>
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
                <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100 uppercase font-outfit flex items-center gap-2">
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

          {/* Section: Recent Documentation Operations */}
          <div className="space-y-5 pt-2">
            <div className="text-left">
              <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100 uppercase font-outfit">
                Recent Document Activity
              </h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Latest updates across the platform</p>
            </div>

            <div className="bg-card border border-border/30 rounded-2xl overflow-hidden shadow-xs">
              {recentDocs.map((doc, i) => (
                <div
                  key={doc.id}
                  onClick={() => handleOpenDoc(doc.id)}
                  className={cn(
                    "flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-slate-900/30 transition-all group cursor-pointer text-left",
                    i !== recentDocs.length - 1 && "border-b border-border/15"
                  )}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-900 border border-border/30 flex items-center justify-center text-base shadow-xs shrink-0 select-none group-hover:scale-105 transition-transform">
                      {doc.emoji || '📄'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs mb-0.5 group-hover:text-primary transition-colors text-slate-900 dark:text-slate-100 truncate">
                        {doc.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-wider flex-wrap">
                        <span className="text-primary">{getCategoryLabel(doc.category)}</span>
                        <span className="text-slate-350 dark:text-slate-700 font-bold select-none hidden sm:inline">•</span>
                        <span className="text-slate-500 font-semibold hidden sm:inline">{format(new Date(doc.updatedAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5">
                      {doc.status && (
                        <Badge className={cn(
                          "font-bold text-[8px] uppercase px-2 py-0.5 rounded-lg border",
                          doc.status === 'published' && "bg-emerald-500/10 border-emerald-500/30 text-emerald-500",
                          doc.status === 'draft' && "bg-amber-500/10 border-amber-500/30 text-amber-500",
                          doc.status === 'archived' && "bg-rose-500/10 border-rose-500/30 text-rose-500"
                        )}>
                          {doc.status}
                        </Badge>
                      )}
                      {doc.tags.slice(0, 1).map(tag => (
                        <Badge key={tag} className="bg-slate-100 dark:bg-slate-900 border border-border/40 text-slate-400 font-bold text-[8px] uppercase px-2 py-0.5 rounded-lg">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
              {recentDocs.length === 0 && (
                <div className="p-8 text-center">
                  <Compass className="w-8 h-8 text-slate-650 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 italic">No manuals available for reading under this active profile.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Section Directory insights & Sim Panel (Span 1) */}
        <div className="space-y-8">

          {/* Section Directory insights card */}
          <div className="space-y-4">
            <h2 className="text-sm font-black flex items-center gap-2 text-slate-900 dark:text-slate-200 uppercase tracking-widest font-outfit text-left">
              <Compass className="w-4 h-4 text-primary shrink-0" /> Module Density Distribution
            </h2>
            <Card className="bg-card border-border/40 shadow-xs text-left overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dynamic manual density by category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {sectionMetrics.map((c) => {
                  const Icon = c.id === 'teacher' ? GraduationCap
                    : c.id === 'admin' ? ShieldAlert
                      : c.id === 'student' ? Backpack
                        : c.id === 'developer' ? Code2
                          : c.icon === 'Users2' ? Users2
                            : c.icon === 'Briefcase' ? Briefcase
                              : BookOpen;

                  const color = c.id === 'teacher' ? 'text-primary'
                    : c.id === 'admin' ? 'text-purple-400'
                      : c.id === 'student' ? 'text-amber-400'
                        : c.id === 'developer' ? 'text-sky-400'
                          : 'text-primary';

                  return (
                    <div key={c.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={cn("w-4 h-4 shrink-0", color)} />
                          <span className="truncate text-slate-800 dark:text-slate-200 font-semibold uppercase">{c.label}</span>
                        </div>
                        <span className="text-slate-400 font-black shrink-0">{c.count} docs</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden border border-border/20">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            c.id === 'teacher' ? "bg-primary" :
                              c.id === 'admin' ? "bg-purple-500" :
                                c.id === 'student' ? "bg-amber-500" :
                                  c.id === 'developer' ? "bg-sky-500" : "bg-primary"
                          )}
                          style={{ width: `${c.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {sectionMetrics.length === 0 && (
                  <p className="text-xs text-slate-500 italic text-center py-4">No modules configured yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

        </div>

      </div>

    </div>
  );
}
