'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useProjectStore } from '@/store/useProjectStore';
import { LuBookOpen as BookOpen, LuArrowRight as ArrowRight } from 'react-icons/lu';

import { toSlug } from '@/lib/utils';

export default function ClientProjectPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();
  const { documents } = useDocumentStore();
  const { projects } = useProjectStore();

  const project = projects.find(p => p.id === projectId || toSlug(p.name) === projectId);
  const resolvedProjectId = project?.id || projectId;
  const projectDocs = documents.filter(d => d.projectId === resolvedProjectId && d.status === 'published');

  // Auto-navigate to first doc
  useEffect(() => {
    if (projectDocs.length > 0) {
      router.replace(`/client/${projectId}/docs/${toSlug(projectDocs[0].title)}`);
    }
  }, [projectDocs, projectId, router]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-center mx-auto text-4xl select-none">
          {project?.icon || '📂'}
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-foreground font-outfit uppercase tracking-wider">{project?.name || 'Module'}</h1>
          <p className="text-sm text-muted-foreground font-medium">Loading your documentation…</p>
        </div>
        {projectDocs.length === 0 && (
          <p className="text-xs text-muted-foreground/70 italic">No published documents available yet. Please contact your administrator.</p>
        )}
      </div>
    </div>
  );
}
