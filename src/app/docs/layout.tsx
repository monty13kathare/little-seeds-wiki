'use client';

import Sidebar from '@/components/shared/Sidebar';
import { Sun, Moon, Menu } from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useEffect, useState } from 'react';
import PageLoader from '@/components/shared/PageLoader';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const { mode, setMode } = useThemeStore();
  const { fetchProjects, projects } = useProjectStore();
  const { fetchDocuments, documents } = useDocumentStore();
  const { user, logout } = useAuthStore();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const router = useRouter();
  const params = useParams();

  // Calculate dynamic breadcrumb values
  const docId = params?.id as string | undefined;
  const activeDoc = docId ? documents.find(d => d.id === docId) : null;
  const project = projects[0];
  const categoryName = project?.sections?.find(s => s.id === activeDoc?.category)?.label || activeDoc?.category || 'Documentation';

  useEffect(() => {
    const initializeDatabaseAndStores = async () => {
      try {
        await fetchProjects();
        await fetchDocuments();
      } catch (error) {
        console.error('Failed to initialize database stores:', error);
      } finally {
        setDataLoaded(true);
      }
    };
    initializeDatabaseAndStores();
  }, [fetchProjects, fetchDocuments]);

  useEffect(() => {
    const handleOpenSidebar = () => setMobileSidebarOpen(true);
    document.addEventListener('openMobileSidebar', handleOpenSidebar);
    return () => document.removeEventListener('openMobileSidebar', handleOpenSidebar);
  }, []);

  if (!dataLoaded) {
    return (
      <PageLoader
        variant="dashboard"
        icon="/ls-image.png"
        label="Little Seeds Docs"
        hint="Loading documentation..."
      />
    );
  }

  // Detect if logged in user is Admin
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'admin';

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar mobileOpen={mobileSidebarOpen} onMobileOpenChange={setMobileSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-8 bg-card/50 backdrop-blur-md sticky top-0 z-30 gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-accent transition-all cursor-pointer shrink-0"
            aria-label="Open navigation"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex-1 max-w-xl min-w-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground truncate">
              <span className="truncate">Little Seeds</span>
              <span className="text-border">/</span>
              <span className="truncate">{categoryName}</span>
              {activeDoc && (
                <>
                  <span className="text-border">/</span>
                  <span className="text-foreground font-medium truncate">{activeDoc.title}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-accent flex items-center justify-center text-muted-foreground transition-all cursor-pointer"
              title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {mode === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Only show Admin Profile Dropdown if logged in as admin */}
            {isAdmin && user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-3 pl-3 pr-1 py-1 rounded-full hover:bg-accent transition-all border border-border/50 cursor-pointer">
                  <span className="text-sm font-semibold hidden lg:block">{user?.name}</span>
                  <Avatar className="w-8 h-8 ring-2 ring-background">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">{user?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/settings')}
                    className="cursor-pointer"
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard/settings')}
                    className="cursor-pointer"
                  >
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer text-rose-500 focus:text-rose-600 focus:bg-rose-500/10"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background/50 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
