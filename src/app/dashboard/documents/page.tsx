'use client';

import { useDocumentStore } from '@/store/useDocumentStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DocumentsPage() {
  const router = useRouter();
  const { activeDocId, documents, createDocument } = useDocumentStore();

  useEffect(() => {
    // If we have an active doc, go there
    if (activeDocId) {
      router.replace(`/dashboard/documents/${activeDocId}`);
    } else if (documents.length > 0) {
      // Go to first doc if none active
      router.replace(`/dashboard/documents/${documents[0].id}`);
    }
  }, [activeDocId, documents, router]);

  if (documents.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#060b17]">
        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20">
          <FileText className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-slate-200">No Documents Found</h2>
        <p className="text-slate-400 mb-8 max-w-md">
          You don't have any documents yet. Create your first document to start building your knowledge base.
        </p>
        <Button 
          onClick={async () => {
            const doc = await createDocument(null);
            router.push(`/dashboard/documents/${doc.id}`);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" /> Create Document
        </Button>
      </div>
    );
  }

  // Fallback while redirecting
  return (
    <div className="flex-1 flex items-center justify-center bg-[#060b17]">
      <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
}
