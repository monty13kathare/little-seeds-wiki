'use client';

import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline as UnderlineIcon, Code, 
  Type, Palette, Highlighter, Link as LinkIcon, 
  Heading1, Heading2, List, Quote
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BubbleMenuProps {
  editor: Editor;
}

export default function FloatingBubbleMenu({ editor }: BubbleMenuProps) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 bg-[#0c2118] border border-white/10 rounded-xl shadow-2xl p-1 backdrop-blur-xl">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          "p-2 rounded-lg transition-colors hover:bg-white/5",
          editor.isActive('bold') ? "text-primary bg-primary/10" : "text-slate-400"
        )}
      >
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          "p-2 rounded-lg transition-colors hover:bg-white/5",
          editor.isActive('italic') ? "text-primary bg-primary/10" : "text-slate-400"
        )}
      >
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(
          "p-2 rounded-lg transition-colors hover:bg-white/5",
          editor.isActive('underline') ? "text-primary bg-primary/10" : "text-slate-400"
        )}
      >
        <UnderlineIcon className="w-3.5 h-3.5" />
      </button>
      
      <div className="w-px h-4 bg-white/10 mx-1" />
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          "p-2 rounded-lg transition-colors hover:bg-white/5",
          editor.isActive('heading', { level: 1 }) ? "text-primary bg-primary/10" : "text-slate-400"
        )}
      >
        <Heading1 className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          "p-2 rounded-lg transition-colors hover:bg-white/5",
          editor.isActive('heading', { level: 2 }) ? "text-primary bg-primary/10" : "text-slate-400"
        )}
      >
        <Heading2 className="w-3.5 h-3.5" />
      </button>
      
      <div className="w-px h-4 bg-white/10 mx-1" />
      
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          "p-2 rounded-lg transition-colors hover:bg-white/5",
          editor.isActive('bulletList') ? "text-primary bg-primary/10" : "text-slate-400"
        )}
      >
        <List className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          "p-2 rounded-lg transition-colors hover:bg-white/5",
          editor.isActive('blockquote') ? "text-primary bg-primary/10" : "text-slate-400"
        )}
      >
        <Quote className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
