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

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-10 max-w-4xl mx-auto font-inter text-foreground flex flex-col justify-center min-h-[75vh]">
      <div className="flex flex-col items-center justify-center py-20 sm:py-28 px-6 sm:px-12 text-center border border-dashed border-border/60 rounded-[2rem] bg-card shadow-2xl relative overflow-hidden group mx-4 sm:mx-0">
        {/* Background ambient gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-60" />
        
        {/* Custom Logo Container */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white border border-border/40 shadow-xl rounded-3xl flex items-center justify-center mb-6 sm:mb-8 overflow-hidden z-10 transition-transform group-hover:scale-105 duration-500">
          <img src="/ls-image.png" alt="Little Seeds Docs" className="w-full h-full object-contain p-3" />
        </div>
        
        {/* Typography */}
        <h2 className="text-3xl sm:text-5xl font-bold font-outfit tracking-tight text-foreground z-10">
          Little Seeds Docs
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground font-semibold mt-4 sm:mt-5 max-w-lg mx-auto leading-relaxed z-10">
          The documentation portal is currently empty. To create an introduction or getting started guide, please sign in to the <span className="text-primary font-bold">Admin Dashboard</span> and publish a new manual.
        </p>
      </div>
    </div>
  );
}
