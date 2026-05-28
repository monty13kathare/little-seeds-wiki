'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import ClientSidebar from '@/components/features/client/ClientSidebar';
import { LuLogOut as LogOut, LuMenu as Menu, LuX as X, LuSun as Sun, LuMoon as Moon } from 'react-icons/lu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, toSlug } from '@/lib/utils';

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const { fetchDocuments } = useDocumentStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // Client's own dark/light override — persisted in localStorage
  const [clientMode, setClientMode] = useState<'dark' | 'light' | null>(null);

  useEffect(() => {
    // Auth guard: must be authenticated as CLIENT for this project
    const savedAuth = typeof window !== 'undefined' ? localStorage.getItem('nexus-auth') : null;
    let hasAuth = false;
    let savedRole = '';
    let savedProjectId = '';
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        if (parsed.state?.isAuthenticated && parsed.state?.user) {
          hasAuth = true;
          savedRole = parsed.state.user.role;
          savedProjectId = parsed.state.user.assignedProjectId || '';
        }
      } catch {}
    }

    if (!isAuthenticated && !hasAuth) {
      router.replace('/login');
      return;
    }

    // A non-client trying to access client portal → back to dashboard
    const role = user?.role || savedRole;
    const assignedProject = user?.assignedProjectId || savedProjectId;
    
    if (role !== 'CLIENT') {
      router.replace('/dashboard');
      return;
    }

    const project = projects.find(p => p.id === projectId || toSlug(p.name) === projectId);
    const resolvedProjectId = project?.id || projectId;

    // Client accessing wrong project → redirect to their project
    if (assignedProject && assignedProject !== resolvedProjectId) {
      router.replace(`/client/${assignedProject}`);
      return;
    }

    const init = async () => {
      await fetchProjects();
      await fetchDocuments();
      setLoaded(true);
    };
    init();
  }, [isAuthenticated, router, projectId, projects]);

  // Apply project portal theme — runs whenever projects data loads/changes
  useEffect(() => {
    const project = projects.find(p => p.id === projectId || toSlug(p.name) === projectId);
    if (!project) return; // still loading

    // Use saved theme or fall back to sensible defaults
    const mode       = project.portalTheme?.mode        || 'dark';
    const accentColor = project.portalTheme?.accentColor || 'blue';
    const fontFamily = project.portalTheme?.fontFamily   || 'inter';
    const fontSize   = project.portalTheme?.fontSize    || 'base';

    const root = document.documentElement;

    // ── Dark / Light ──────────────────────────────────────────────────────────
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // ── Accent colour ─────────────────────────────────────────────────────────
    if (accentColor.startsWith('#')) {
      root.removeAttribute('data-accent');
      root.style.setProperty('--accent-primary', accentColor);
      root.style.setProperty('--accent-foreground', 'oklch(0.985 0 0)');
    } else {
      root.style.removeProperty('--accent-primary');
      root.style.removeProperty('--accent-foreground');
      root.setAttribute('data-accent', accentColor);
    }

    // ── Font size ────────────────────────────────────────────────────────────
    const sizeMap: Record<string, string> = {
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px'
    };
    root.style.fontSize = sizeMap[fontSize] || '16px';

    // ── Font family ───────────────────────────────────────────────────────────
    const fontMap: Record<string, string> = {
      inter:       'var(--font-inter)',
      outfit:      'var(--font-outfit)',
      roboto:      'var(--font-roboto)',
      montserrat:  'var(--font-montserrat)',
      mono:        'var(--font-jetbrains)',
    };
    const fontVar = fontMap[fontFamily] ?? 'var(--font-inter)';
    root.style.setProperty('--font-primary', `${fontVar}, sans-serif`);
    document.body.style.fontFamily = `${fontVar}, sans-serif`;
    document.body.classList.remove(
      'font-inter', 'font-outfit', 'font-roboto',
      'font-montserrat', 'font-mono'
    );
    document.body.classList.add(`font-${fontFamily}`);

    // Cleanup: restore admin defaults when client navigates away / logs out
    return () => {
      root.classList.add('dark');
      root.setAttribute('data-accent', 'blue');
      root.style.fontSize = '';
      root.style.removeProperty('--font-primary');
      root.style.removeProperty('--accent-primary');
      root.style.removeProperty('--accent-foreground');
      document.body.style.fontFamily = '';
    };
  }, [projects, projectId]); // re-runs whenever projects load or projectId changes

  // Load client's saved mode preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`client-mode-${projectId}`) as 'dark' | 'light' | null;
    if (saved) setClientMode(saved);
  }, [projectId]);

  // Apply client's personal mode override on top of project theme
  useEffect(() => {
    if (!clientMode) return;
    const root = document.documentElement;
    if (clientMode === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [clientMode]);

  const toggleMode = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const next = isDark ? 'light' : 'dark';
    setClientMode(next);
    localStorage.setItem(`client-mode-${projectId}`, next);
    if (next === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  };

  // Derive icon: clientMode overrides project default
  const project = projects.find(p => p.id === projectId || toSlug(p.name) === projectId);
  const projectDefaultMode = project?.portalTheme?.mode || 'dark';
  const isDarkMode = clientMode ? clientMode === 'dark' : projectDefaultMode === 'dark';

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <ClientSidebar projectId={projectId} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Bar */}
        <header className="h-14 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-30 px-3 sm:px-5 flex items-center justify-between shrink-0 gap-3">

          {/* Left: Hamburger (mobile) + Little Seeds Portal brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Little Seeds Portal brand */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-md flex items-center justify-center font-outfit font-black text-xs shrink-0">V</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden sm:block">Little Seeds Portal</span>
            </div>
          </div>

          {/* Right: Theme toggle + Avatar + Name + Logout */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Dark / Light toggle */}
            <button
              onClick={toggleMode}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
            >
              {isDarkMode
                ? <Sun className="w-4 h-4" />
                : <Moon className="w-4 h-4" />
              }
            </button>

            <div className="flex items-center gap-2 pl-1">
              <Avatar className="w-7 h-7 border border-border shrink-0">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary/20 text-primary text-[9px] font-bold">{user?.name?.charAt(0) || 'C'}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold hidden md:block text-foreground truncate max-w-[100px]">{user?.name}</span>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>


        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
