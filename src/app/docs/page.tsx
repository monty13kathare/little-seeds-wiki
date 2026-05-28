'use client';

import { useDocumentStore } from '@/store/useDocumentStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageLoader from '@/components/shared/PageLoader';
import { toSlug } from '@/lib/utils';

export default function DocsPage() {
  const { documents } = useDocumentStore();
  const { projects } = useProjectStore();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  const project = projects[0];
  const publishedDocs = documents.filter(d => d.status === 'published' && (!project || d.projectId === project.id));

  useEffect(() => {
    // If there are documents, redirect to the most appropriate "intro" doc
    if (publishedDocs.length > 0) {
      // Prioritize documents that look like an introduction
      const welcomeDoc = publishedDocs.find(d =>
        d.title.toLowerCase().includes('introduction') ||
        d.title.toLowerCase().includes('getting started') ||
        d.title.toLowerCase().includes('welcome') ||
        d.title.toLowerCase().includes('overview')
      ) || publishedDocs[0]; // fallback to the first available doc

      const p = projects.find(proj => proj.id === welcomeDoc.projectId);
      const sectionLabel = p?.sections?.find(s => s.id === welcomeDoc.category)?.label || welcomeDoc.category;
      router.replace(`/docs/${toSlug(sectionLabel)}/${toSlug(welcomeDoc.title)}`);
    } else {
      // No documents to redirect to
      setIsRedirecting(false);
    }
  }, [publishedDocs, projects, router]);

  // Show loader while we find the redirect target
  if (isRedirecting && publishedDocs.length > 0) {
    return (
      <PageLoader
        variant="dashboard"
        icon="/ls-image.png"
        label="Little Seeds Docs"
        hint="Loading introduction..."
      />
    );
  }

  // Empty state if absolutely no published documents exist in the entire system
  return (
    <div className="p-6 md:p-8 space-y-10 max-w-7xl mx-auto font-inter text-slate-700 dark:text-slate-300 h-full flex flex-col justify-center">
      <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-border/50 rounded-3xl mt-8 bg-card shadow-sm">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-5 text-3xl shadow-inner">
          🌱
        </div>
        <h2 className="text-xl font-black font-outfit uppercase tracking-wider text-slate-900 dark:text-slate-100">Welcome to Little Seeds Docs</h2>
        <p className="text-sm text-muted-foreground font-medium mt-2 max-w-md mx-auto leading-relaxed">
          The documentation portal is currently empty. To create an introduction or getting started guide, please sign in to the Admin Dashboard and publish a new manual.
        </p>
      </div>
    </div>
  );
}
