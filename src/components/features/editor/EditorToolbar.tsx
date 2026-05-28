'use client';

import { Editor } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Superscript as SuperscriptIcon, 
  Subscript as SubscriptIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  List, ListOrdered, CheckSquare, Quote, Minus, Link as LinkIcon, 
  Image as ImageIcon, Table as TableIcon, Undo, Redo, ChevronDown, 
  Palette, Highlighter, RowsIcon, Columns, Trash2, X, MoreHorizontal,
  Type as FontIcon, CaseUpper, GripHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import EditorModal from './EditorModal';

interface ToolbarProps { editor: Editor }

const FONT_FAMILIES = [
  { label: 'Sans Serif', value: 'Inter, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Monospace', value: '"Courier New", monospace' },
  { label: 'Display', value: 'Outfit, sans-serif' },
];

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '32px', '48px'];

const TEXT_COLORS = ['#ffffff','#f43f5e','#fb923c','#fbbf24','#4ade80','#34d399','#22d3ee','#60a5fa','#a78bfa','#f472b6','#000000'];
const HIGHLIGHT_COLORS = ['#fef08a','#bbf7d0','#bfdbfe','#f5d0fe','#fecaca','#fed7aa'];

const BLOCK_TYPES = [
  { label: 'Paragraph', action: (e: Editor) => e.chain().focus().setParagraph().run(), active: (e: Editor) => e.isActive('paragraph') && !e.isActive('heading') },
  { label: 'Heading 1', action: (e: Editor) => e.chain().focus().toggleHeading({ level: 1 }).run(), active: (e: Editor) => e.isActive('heading', { level: 1 }), style: 'text-2xl font-black' },
  { label: 'Heading 2', action: (e: Editor) => e.chain().focus().toggleHeading({ level: 2 }).run(), active: (e: Editor) => e.isActive('heading', { level: 2 }), style: 'text-xl font-bold' },
  { label: 'Heading 3', action: (e: Editor) => e.chain().focus().toggleHeading({ level: 3 }).run(), active: (e: Editor) => e.isActive('heading', { level: 3 }), style: 'text-lg font-semibold' },
  { label: 'Code Block', action: (e: Editor) => e.chain().focus().toggleCodeBlock().run(), active: (e: Editor) => e.isActive('codeBlock') },
  { label: 'Blockquote', action: (e: Editor) => e.chain().focus().toggleBlockquote().run(), active: (e: Editor) => e.isActive('blockquote') },
];

function Btn({ onClick, active, children, title, className }: { onClick: () => void; active?: boolean; children: React.ReactNode; title?: string; className?: string }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      className={cn(
        'h-9 w-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0',
        active && 'text-primary bg-primary/10',
        className
      )}
    >
      {children}
    </button>
  );
}

function Dropdown({ label, children, className, icon: Icon }: { label?: React.ReactNode; children: React.ReactNode; className?: string; icon?: any }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 4, left: rect.left });
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        ref.current && !ref.current.contains(target) &&
        (!portalRef.current || !portalRef.current.contains(target))
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative" ref={ref}>
      <button
        onMouseDown={e => { e.preventDefault(); setOpen(!open); }}
        className={cn(
          "flex items-center gap-2 px-3 h-9 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground text-[10px] font-bold uppercase tracking-wider transition-colors border border-transparent",
          open && "bg-accent text-foreground",
          className
        )}
      >
        {Icon && <Icon className="w-4 h-4" />}
        {label}
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && mounted && createPortal(
        <div 
          ref={portalRef}
          className="fixed z-9999 bg-card border border-border rounded-xl shadow-2xl min-w-[200px] p-1 overflow-hidden pointer-events-auto"
          style={{ top: coords.top, left: coords.left }}
        >
          {children}
        </div>,
        document.body
      )}
    </div>
  );
}

export default function EditorToolbar({ editor }: ToolbarProps) {
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: 'image' | 'link'; title: string } | null>(null);

  const handleLinkSubmit = ({ url, text }: { url: string; text?: string }) => {
    if (text) editor.chain().focus().extendMarkRange('link').insertContent(`<a href="${url}">${text}</a>`).run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleImageSubmit = ({ url }: { url: string }) => editor.chain().focus().setImage({ src: url }).run();

  return (
    <div className="flex justify-center w-full max-w-full">
      <div className="flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-1.5 p-2 bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl max-w-full mx-auto w-full sm:w-fit overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center gap-0.5 border-r border-border/50 pr-1.5 mr-0.5 shrink-0">
          <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo className="w-4 h-4" /></Btn>
          <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo className="w-4 h-4" /></Btn>
        </div>

        {/* Structure Dropdown */}
        <Dropdown label={BLOCK_TYPES.find(b => b.active(editor))?.label || 'Text'}>
          <div className="p-1 space-y-0.5">
            {BLOCK_TYPES.map(bt => (
              <button
                key={bt.label}
                onMouseDown={e => { e.preventDefault(); bt.action(editor); }}
                className={cn(
                  'w-full text-left px-3 py-2 text-xs font-medium hover:bg-accent rounded-md transition-colors',
                  bt.active(editor) ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                )}
              >
                {bt.label}
              </button>
            ))}
          </div>
        </Dropdown>

        {/* Font & Size */}
        <Dropdown icon={FontIcon}>
          <div className="p-1 space-y-0.5 max-h-60 overflow-y-auto">
            {FONT_FAMILIES.map(f => (
              <button
                key={f.label}
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().setFontFamily(f.value).run(); }}
                style={{ fontFamily: f.value }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded-md"
              >
                {f.label}
              </button>
            ))}
            <div className="h-px bg-border my-1" />
            <div className="grid grid-cols-4 gap-1 p-1">
              {FONT_SIZES.map(s => (
                <button
                  key={s}
                  onMouseDown={e => { e.preventDefault(); editor.chain().focus().setMark('textStyle', { fontSize: s }).run(); }}
                  className="px-1 py-1.5 text-[10px] hover:bg-accent border rounded text-center"
                >
                  {s.replace('px', '')}
                </button>
              ))}
            </div>
          </div>
        </Dropdown>

        {/* Basic Marks */}
        <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-1 ml-1">
          <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold className="w-4 h-4" /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic className="w-4 h-4" /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon className="w-4 h-4" /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strike"><Strikethrough className="w-4 h-4" /></Btn>
        </div>

        {/* Alignment Dropdown */}
        <Dropdown icon={AlignLeft}>
          <div className="flex items-center p-1 gap-1">
            <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}><AlignLeft className="w-4 h-4" /></Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}><AlignCenter className="w-4 h-4" /></Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })}><AlignRight className="w-4 h-4" /></Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })}><AlignJustify className="w-4 h-4" /></Btn>
          </div>
        </Dropdown>

        {/* Advanced Marks Dropdown */}
        <Dropdown icon={CaseUpper}>
          <div className="p-1 space-y-1">
            <div className="flex gap-1">
              <Btn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')}><SubscriptIcon className="w-4 h-4" /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')}><SuperscriptIcon className="w-4 h-4" /></Btn>
              <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}><Code className="w-4 h-4" /></Btn>
            </div>
            <div className="h-px bg-border my-1" />
            <div className="grid grid-cols-5 gap-1 p-1">
              {TEXT_COLORS.map(c => (
                <button key={c} onMouseDown={e => { e.preventDefault(); editor.chain().focus().setColor(c).run(); }} className="w-5 h-5 rounded border border-border/50" style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="grid grid-cols-6 gap-1 p-1">
              {HIGHLIGHT_COLORS.map(c => (
                <button key={c} onMouseDown={e => { e.preventDefault(); editor.chain().focus().setHighlight({ color: c }).run(); }} className="w-5 h-5 rounded border border-border/50" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </Dropdown>

        {/* Lists & Breaks */}
        <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-1 ml-1">
          <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List"><List className="w-4 h-4" /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List"><ListOrdered className="w-4 h-4" /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} title="Task List"><CheckSquare className="w-4 h-4" /></Btn>
          <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule"><Minus className="w-4 h-4" /></Btn>
        </div>

        {/* Media & Table */}
        <div className="flex items-center gap-0.5 ml-auto md:ml-0">
          <Btn onClick={() => setModalConfig({ isOpen: true, type: 'link', title: 'Insert Link' })} active={editor.isActive('link')} title="Link"><LinkIcon className="w-4 h-4" /></Btn>
          <Btn onClick={() => setModalConfig({ isOpen: true, type: 'image', title: 'Insert Image' })} title="Image"><ImageIcon className="w-4 h-4" /></Btn>
          <Btn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Table"><TableIcon className="w-4 h-4" /></Btn>
        </div>
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

      {editor.isActive('table') && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-2 mt-2 bg-accent/30 rounded-lg border border-border">
          <button onClick={() => editor.chain().focus().addRowAfter().run()} className="text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5"><RowsIcon className="w-3 h-3" /> Add Row</button>
          <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="text-[10px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5"><Columns className="w-3 h-3" /> Add Column</button>
          <button onClick={() => editor.chain().focus().deleteTable().run()} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1.5 ml-auto"><Trash2 className="w-3 h-3" /> Delete Table</button>
        </div>
      )}
    </div>
  );
}
