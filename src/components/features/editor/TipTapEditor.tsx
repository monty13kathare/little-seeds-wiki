'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
// Typography extension removed — its inputRules conflict with list item editing
import { common, createLowlight } from 'lowlight';
import { Table } from '@tiptap/extension-table';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { 
  FileText, Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare,
  Code, Image as ImageIcon, Link as LinkIcon, Table as TableIcon, Minus
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import EditorToolbar from './EditorToolbar';
import FloatingBubbleMenu from './FloatingBubbleMenu';
import EditorModal from './EditorModal';
import { cn } from '@/lib/utils';
import { markdownToJSON, jsonToMarkdown } from '@/lib/converter';

const safeParseJSON = (content: string | undefined) => {
  if (!content) return '';
  try {
    return JSON.parse(content);
  } catch (e) {
    if (content.startsWith('#') || content.includes('\n')) {
      try {
        return JSON.parse(markdownToJSON(content));
      } catch {
        return content;
      }
    }
    return content;
  }
};

const lowlight = createLowlight(common);

const SLASH_ITEMS = [
  { id: 'h1', label: 'Heading 1', desc: 'Big section heading', icon: Heading1, action: (e: any) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { id: 'h2', label: 'Heading 2', desc: 'Medium section heading', icon: Heading2, action: (e: any) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { id: 'h3', label: 'Heading 3', desc: 'Small section heading', icon: Heading3, action: (e: any) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { id: 'bullet', label: 'Bullet List', desc: 'Simple bulleted list', icon: List, action: (e: any) => e.chain().focus().toggleBulletList().run() },
  { id: 'ordered', label: 'Numbered List', desc: 'Ordered sequential list', icon: ListOrdered, action: (e: any) => e.chain().focus().toggleOrderedList().run() },
  { id: 'todo', label: 'Task List', desc: 'Checkbox checklist', icon: CheckSquare, action: (e: any) => e.chain().focus().toggleTaskList().run() },
  { id: 'code', label: 'Code Block', desc: 'Syntax-highlighted code', icon: Code, action: (e: any) => e.chain().focus().toggleCodeBlock().run() },
  { id: 'link', label: 'Link', desc: 'Insert hyperlink URL', icon: LinkIcon, action: (e: any) => {} },
  { id: 'image', label: 'Image', desc: 'Insert image from URL', icon: ImageIcon, action: (e: any) => {} },
  { id: 'table', label: 'Table', desc: 'Insert a 3x3 data grid', icon: TableIcon, action: (e: any) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { id: 'divider', label: 'Horizontal Line', desc: 'Section break divider', icon: Minus, action: (e: any) => e.chain().focus().setHorizontalRule().run() },
];

interface TipTapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  editable?: boolean;
  placeholder?: string;
  editorMode?: 'rich' | 'markdown' | 'preview';
  setEditorMode?: (mode: 'rich' | 'markdown' | 'preview') => void;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function TipTapEditor({ content, onChange, editable = true, placeholder, editorMode, setEditorMode }: TipTapEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: 'image' | 'link'; title: string } | null>(null);

  // Slash Commands State
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashMenuCoords, setSlashMenuCoords] = useState({ top: 0, left: 0 });
  const [slashSearch, setSlashSearch] = useState('');
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Bubble Menu Selection State
  const [bubbleCoords, setBubbleCoords] = useState({ top: 0, left: 0 });
  const [bubbleOpen, setBubbleOpen] = useState(false);

  // Editor Mode State
  const [localEditorMode, setLocalEditorMode] = useState<'rich' | 'markdown' | 'preview'>('rich');
  const activeMode = editorMode !== undefined ? editorMode : localEditorMode;
  const setActiveMode = setEditorMode !== undefined ? setEditorMode : setLocalEditorMode;
  const [markdownContent, setMarkdownContent] = useState('');
  // prevModeRef is initialised here but the sync useEffect must run after useEditor (below)
  const prevModeRef = useRef<string>(activeMode);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder: placeholder || 'Start writing… Type "/" for quick commands!' }),
      Underline,
      // Typography removed — interferes with list node structure via inputRules
      TextStyle,
      Color,
      FontFamily,
      Subscript,
      Superscript,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ allowBase64: true, inline: false }),
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
        HTMLAttributes: { class: 'editor-link', target: '_blank', rel: 'noopener noreferrer' },
      }),
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: safeParseJSON(content),
    editable,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setWordCount(countWords(text));
      setCharCount(text.length);
      onChange?.(JSON.stringify(editor.getJSON()));

      // Slash commands trigger
      if (slashMenuOpen) {
        const { selection } = editor.state;
        const textBeforeCursor = editor.state.doc.textBetween(
          Math.max(0, selection.from - 20),
          selection.from
        );
        const match = textBeforeCursor.match(/\/([a-zA-Z0-9]*)$/);
        if (match) {
          setSlashSearch(match[1]);
          setSlashSelectedIndex(0);
        } else {
          setSlashMenuOpen(false);
        }
      }
    },
    editorProps: {
      attributes: {
        class: 'nexus-editor focus:outline-none',
      },
      handlePaste: (view, event) => {
        const { state } = view;
        const { selection } = state;
        const $from = selection.$from;
        
        let isInsideCodeBlock = false;
        for (let depth = $from.depth; depth > 0; depth--) {
          if ($from.node(depth).type.name === 'codeBlock') {
            isInsideCodeBlock = true;
            break;
          }
        }

        if (isInsideCodeBlock) {
          return false; // Bypass markdown parser so standard raw text paste is handled naturally inside codeBlock!
        }

        const text = event.clipboardData?.getData('text/plain');
        if (text && (text.includes('#') || text.includes('**') || text.includes('- ') || text.includes('[') || text.includes('|'))) {
          try {
            const json = JSON.parse(markdownToJSON(text));
            const { schema } = view.state;
            const node = schema.nodeFromJSON(json);
            view.dispatch(view.state.tr.replaceSelectionWith(node));
            return true;
          } catch {
            return false;
          }
        }
        return false;
      }
    },
  });

  // Sync editor contents reactively when activeMode changes — must be after useEditor!
  useEffect(() => {
    if (!editor) return;
    const prevMode = prevModeRef.current;
    if (prevMode === activeMode) return;

    // If switching away from markdown mode, sync textarea to editor
    if (prevMode === 'markdown') {
      const parsedJSON = safeParseJSON(markdownToJSON(markdownContent));
      editor.commands.setContent(parsedJSON, { emitUpdate: true });
    }

    // If switching into markdown mode, sync editor to textarea
    if (activeMode === 'markdown') {
      const currentJSON = JSON.stringify(editor.getJSON());
      setMarkdownContent(jsonToMarkdown(currentJSON));
    }

    prevModeRef.current = activeMode;
  }, [activeMode, editor, markdownContent]);

  const handleToggleMode = (newMode: 'rich' | 'markdown' | 'preview') => {
    if (!editor) return;
    setActiveMode(newMode);
  };

  const handleMarkdownChange = (val: string) => {
    setMarkdownContent(val);
    const parsedJSON = markdownToJSON(val);
    onChange?.(parsedJSON);
  };

  useEffect(() => {
    if (!editor) return;

    const handleSelectionChange = () => {
      const { selection } = editor.state;
      if (!selection || selection.empty) {
        setBubbleOpen(false);
        return;
      }

      const { from, to } = selection;
      if (from === to) {
        setBubbleOpen(false);
        return;
      }

      try {
        const coords = editor.view.coordsAtPos(from);
        const coordsTo = editor.view.coordsAtPos(to);
        const middleLeft = (coords.left + coordsTo.left) / 2;

        setBubbleCoords({
          top: coords.top + window.scrollY - 55,
          left: middleLeft + window.scrollX,
        });
        setBubbleOpen(true);
      } catch (err) {
        setBubbleOpen(false);
      }
    };

    const handleMouseUp = () => {
      setTimeout(() => {
        handleSelectionChange();
      }, 10);
    };

    editor.on('selectionUpdate', handleSelectionChange);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      editor.off('selectionUpdate', handleSelectionChange);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [editor]);

  const filteredItems = SLASH_ITEMS.filter(item =>
    item.label.toLowerCase().includes(slashSearch.toLowerCase()) ||
    item.desc.toLowerCase().includes(slashSearch.toLowerCase())
  );

  // Refs to avoid stale closures in event listeners
  const slashMenuOpenRef = useRef(slashMenuOpen);
  const slashSearchRef = useRef(slashSearch);
  const slashSelectedIndexRef = useRef(slashSelectedIndex);
  const filteredItemsRef = useRef(filteredItems);

  useEffect(() => {
    slashMenuOpenRef.current = slashMenuOpen;
    slashSearchRef.current = slashSearch;
    slashSelectedIndexRef.current = slashSelectedIndex;
    filteredItemsRef.current = filteredItems;
  }, [slashMenuOpen, slashSearch, slashSelectedIndex, filteredItems]);

  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!slashMenuOpenRef.current) {
        if (event.key === '/') {
          setTimeout(() => {
            const { selection } = editor.state;
            const coords = editor.view.coordsAtPos(selection.from);
            setSlashMenuCoords({
              top: coords.bottom + window.scrollY + 5,
              left: coords.left + window.scrollX,
            });
            setSlashMenuOpen(true);
            setSlashSearch('');
            setSlashSelectedIndex(0);
          }, 10);
        }
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setSlashMenuOpen(false);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSlashSelectedIndex(prev => (prev + 1) % filteredItemsRef.current.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSlashSelectedIndex(prev => (prev - 1 + filteredItemsRef.current.length) % filteredItemsRef.current.length);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        const selected = filteredItemsRef.current[slashSelectedIndexRef.current];
        if (selected) {
          const { selection } = editor.state;
          editor.commands.deleteRange({
            from: selection.from - slashSearchRef.current.length - 1,
            to: selection.from
          });
          if (selected.id === 'link' || selected.id === 'image') {
            setModalConfig({ isOpen: true, type: selected.id as any, title: `Insert ${selected.id === 'link' ? 'Link' : 'Image'}` });
          } else {
            selected.action(editor);
          }
        }
        setSlashMenuOpen(false);
      } else if (event.key === 'Backspace' && slashSearchRef.current === '') {
        setSlashMenuOpen(false);
      }
    };

    // Close slash menu on click outside
    const handleMouseClick = () => {
      if (slashMenuOpenRef.current) {
        setSlashMenuOpen(false);
      }
    };

    editor.view.dom.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseClick);
    return () => {
      editor.view.dom?.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseClick);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable && activeMode === 'rich');
  }, [editor, editable, activeMode]);

  // Only sync external content changes after mount — never while user is actively typing
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!editor) return;
    if (!didMountRef.current) {
      // First run: editor was initialized with content already, mark as mounted
      didMountRef.current = true;
      return;
    }
    // Subsequent runs: only sync if editor doesn't have focus (user isn't typing)
    if (editor.isFocused) return;
    const parsed = safeParseJSON(content);
    if (parsed && JSON.stringify(editor.getJSON()) !== JSON.stringify(parsed)) {
      editor.commands.setContent(parsed, { emitUpdate: false });
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;
    const text = editor.getText();
    setWordCount(countWords(text));
    setCharCount(text.length);
  }, [editor]);

  if (!editor) return null;

  const handleLinkSubmit = ({ url, text }: { url: string; text?: string }) => {
    if (text) {
      editor.chain().focus().extendMarkRange('link').insertContent(`<a href="${url}">${text}</a>`).run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const handleImageSubmit = ({ url }: { url: string }) => {
    editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="flex flex-col relative font-inter">
      {/* Rich Text / Markdown / Preview Toggle Tabs - Only show inside child editor if not controlled by parent props */}
      {editable && editorMode === undefined && (
        <div className="flex justify-end gap-1 mb-5 max-w-full px-4">
          <div className="flex items-center gap-1 bg-muted border border-border p-1 rounded-xl shadow-2xl backdrop-blur-xl">
            <button
              onClick={() => handleToggleMode('rich')}
              className={cn(
                "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                activeMode === 'rich'
                  ? "bg-primary text-primary-foreground shadow-md font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Rich Editor
            </button>
            <button
              onClick={() => handleToggleMode('markdown')}
              className={cn(
                "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                activeMode === 'markdown'
                  ? "bg-primary text-primary-foreground shadow-md font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Markdown Source
            </button>
            <button
              onClick={() => handleToggleMode('preview')}
              className={cn(
                "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                activeMode === 'preview'
                  ? "bg-primary text-primary-foreground shadow-md font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Preview
            </button>
          </div>
        </div>
      )}

      {editable && activeMode === 'rich' && (
        <div className="flex sticky top-2 sm:top-6 z-20 justify-center w-full pointer-events-none transition-all mb-4 sm:mb-8">
          <div className="pointer-events-auto max-w-full px-2 sm:px-4 w-full sm:w-auto">
            <EditorToolbar editor={editor} />
          </div>
        </div>
      )}

      {bubbleOpen && mounted && editable && activeMode === 'rich' && createPortal(
        <div 
          className="fixed z-9999 -translate-x-1/2 pointer-events-auto transition-all"
          style={{ top: bubbleCoords.top, left: bubbleCoords.left }}
          onMouseDown={e => e.stopPropagation()}
        >
          <FloatingBubbleMenu editor={editor} />
        </div>,
        document.body
      )}

      <div className="relative min-h-[500px] mt-4">
        {activeMode !== 'markdown' ? (
          <EditorContent editor={editor} />
        ) : (
          <textarea
            value={markdownContent}
            onChange={e => handleMarkdownChange(e.target.value)}
            className="w-full min-h-[520px] p-6 bg-card border border-border rounded-2xl font-mono text-sm text-foreground focus:outline-none focus:border-primary/50 resize-y"
            placeholder="# Write your raw Markdown here... (GitHub format)"
          />
        )}
      </div>

      {modalConfig && (
        <EditorModal
          isOpen={modalConfig.isOpen}
          onClose={() => setModalConfig(null)}
          type={modalConfig.type}
          title={modalConfig.title}
          onSubmit={modalConfig.type === 'image' ? handleImageSubmit : handleLinkSubmit}
          defaultValue={modalConfig.type === 'link' ? editor.getAttributes('link').href : ''}
        />
      )}

      {slashMenuOpen && mounted && activeMode === 'rich' && filteredItems.length > 0 && createPortal(
        <div 
          className="fixed z-9999 bg-popover border border-border rounded-xl shadow-2xl min-w-[240px] max-h-72 overflow-y-auto p-1.5 pointer-events-auto font-inter scrollbar-none"
          style={{ top: slashMenuCoords.top, left: slashMenuCoords.left }}
          onMouseDown={e => e.stopPropagation()} // Prevent click-outside closure
        >
          <div className="px-2 py-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40 mb-1">
            Editor Quick Actions
          </div>
          {filteredItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onMouseDown={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  const { selection } = editor.state;
                  editor.commands.deleteRange({
                    from: selection.from - slashSearch.length - 1,
                    to: selection.from
                  });
                  if (item.id === 'link' || item.id === 'image') {
                    setModalConfig({ isOpen: true, type: item.id as any, title: `Insert ${item.id === 'link' ? 'Link' : 'Image'}` });
                  } else {
                    item.action(editor);
                  }
                  setSlashMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2 py-1.5 text-left rounded-lg transition-all",
                  index === slashSelectedIndex
                    ? "bg-primary/10 text-primary border-l-2 border-primary pl-1.5"
                    : "text-foreground hover:bg-accent/60"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                  index === slashSelectedIndex ? "bg-primary/20 text-primary" : "bg-slate-100 dark:bg-slate-800 text-muted-foreground"
                )}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold">{item.label}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
