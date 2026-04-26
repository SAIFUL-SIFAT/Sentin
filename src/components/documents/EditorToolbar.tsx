"use client";

import React, { useState, useCallback, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  List, ListOrdered, ListChecks, Quote, Minus,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Unlink, Image as ImageIcon,
  RotateCcw, RotateCw, Highlighter, Subscript, Superscript,
  Table as TableIcon, Search, Replace, Maximize, Minimize,
  Type, Palette, Printer, FileDown,
} from 'lucide-react';
import '@tiptap/extension-image';

/* ── Tiny reusable pieces ─────────────────────────────── */

export const TBtn = ({ onClick, active, icon: Icon, title, disabled }: {
  onClick: () => void; active?: boolean; icon: any; title?: string; disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2.5 transition-subtle hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed ${active ? 'text-accent bg-accent/10' : 'text-soft-white/40'}`}
  >
    <Icon size={15} />
  </button>
);

export const TDivider = () => (
  <div className="w-px h-5 bg-border-subtle mx-1.5 self-center" />
);

/* ── Heading dropdown ─────────────────────────────────── */

export const HeadingSelect = ({ editor }: { editor: Editor }) => {
  const current = [1, 2, 3, 4].find(l => editor.isActive('heading', { level: l }));
  return (
    <select
      value={current || 0}
      onChange={e => {
        const v = Number(e.target.value);
        if (v === 0) editor.chain().focus().setParagraph().run();
        else editor.chain().focus().toggleHeading({ level: v as 1|2|3|4 }).run();
      }}
      className="h-8 px-2 bg-transparent border border-border-subtle text-soft-white/60 font-mono text-[10px] uppercase tracking-wider focus:outline-none focus:border-accent/40 cursor-pointer"
    >
      <option value={0} className="bg-[#1a1a1a]">Paragraph</option>
      <option value={1} className="bg-[#1a1a1a]">Heading 1</option>
      <option value={2} className="bg-[#1a1a1a]">Heading 2</option>
      <option value={3} className="bg-[#1a1a1a]">Heading 3</option>
      <option value={4} className="bg-[#1a1a1a]">Heading 4</option>
    </select>
  );
};

/* ── Font family select ───────────────────────────────── */

const FONTS = [
  { label: 'Default', value: '' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: '"IBM Plex Mono", monospace' },
  { label: 'Sans', value: '"IBM Plex Sans", sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
];

export const FontFamilySelect = ({ editor }: { editor: Editor }) => (
  <select
    value={editor.getAttributes('textStyle').fontFamily || ''}
    onChange={e => {
      const v = e.target.value;
      if (v) editor.chain().focus().setFontFamily(v).run();
      else editor.chain().focus().unsetFontFamily().run();
    }}
    className="h-8 px-2 bg-transparent border border-border-subtle text-soft-white/60 font-mono text-[10px] uppercase tracking-wider focus:outline-none focus:border-accent/40 cursor-pointer max-w-[100px]"
  >
    {FONTS.map(f => <option key={f.value} value={f.value} className="bg-[#1a1a1a]">{f.label}</option>)}
  </select>
);

/* ── Highlight color picker ───────────────────────────── */

const HL_COLORS = ['#fde047','#86efac','#7dd3fc','#c4b5fd','#fda4af','#fdba74', '#FFFFFF'];

export const HighlightPicker = ({ editor }: { editor: Editor }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <TBtn onClick={() => setOpen(!open)} active={editor.isActive('highlight')} icon={Highlighter} title="Highlight" />
      {open && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-[#1a1a1a] border border-border-subtle flex gap-1 z-50">
          {HL_COLORS.map(c => (
            <button key={c} onClick={() => { editor.chain().focus().toggleHighlight({ color: c }).run(); setOpen(false); }}
              className="w-5 h-5 rounded-sm border border-white/10 hover:scale-125 transition-transform"
              style={{ backgroundColor: c }}
            />
          ))}
          <button onClick={() => { editor.chain().focus().unsetHighlight().run(); setOpen(false); }}
            className="w-5 h-5 rounded-sm border border-white/10 text-[8px] text-white/40 flex items-center justify-center hover:text-white"
          >✕</button>
        </div>
      )}
    </div>
  );
};

/* ── Text color picker ────────────────────────────────── */

const TXT_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#ffffff','#a0a0a0'];

export const TextColorPicker = ({ editor }: { editor: Editor }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <TBtn onClick={() => setOpen(!open)} icon={Palette} title="Text Color"
        active={!!editor.getAttributes('textStyle').color} />
      {open && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-[#1a1a1a] border border-border-subtle flex gap-1 z-50">
          {TXT_COLORS.map(c => (
            <button key={c} onClick={() => { editor.chain().focus().setColor(c).run(); setOpen(false); }}
              className="w-5 h-5 rounded-sm border border-white/10 hover:scale-125 transition-transform"
              style={{ backgroundColor: c }}
            />
          ))}
          <button onClick={() => { editor.chain().focus().unsetColor().run(); setOpen(false); }}
            className="w-5 h-5 rounded-sm border border-white/10 text-[8px] text-white/40 flex items-center justify-center hover:text-white"
          >✕</button>
        </div>
      )}
    </div>
  );
};

/* ── Link inserter ────────────────────────────────────── */

export const LinkButton = ({ editor }: { editor: Editor }) => {
  const setLink = () => {
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', prev || 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };
  return (
    <>
      <TBtn onClick={setLink} active={editor.isActive('link')} icon={LinkIcon} title="Insert Link" />
      {editor.isActive('link') && (
        <TBtn onClick={() => editor.chain().focus().unsetLink().run()} icon={Unlink} title="Remove Link" />
      )}
    </>
  );
};

/* ── Image inserter ───────────────────────────────────── */

export const ImageButton = ({ editor }: { editor: Editor }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          editor.chain().focus().setImage({ src: result }).run();
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset the input value so the same file can be selected again
    if (event.target) event.target.value = '';
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <TBtn 
        onClick={() => fileInputRef.current?.click()} 
        icon={ImageIcon} 
        title="Upload Image" 
      />
    </>
  );
};

/* ── Table controls ───────────────────────────────────── */

export const TableControls = ({ editor }: { editor: Editor }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <TBtn onClick={() => setOpen(!open)} active={editor.isActive('table')} icon={TableIcon} title="Table" />
      {open && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-[#1a1a1a] border border-border-subtle flex flex-col gap-1 z-50 min-w-[140px]">
          {[
            ['Insert 3×3', () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()],
            ['Add Row Before', () => editor.chain().focus().addRowBefore().run()],
            ['Add Row After', () => editor.chain().focus().addRowAfter().run()],
            ['Add Col Before', () => editor.chain().focus().addColumnBefore().run()],
            ['Add Col After', () => editor.chain().focus().addColumnAfter().run()],
            ['Delete Row', () => editor.chain().focus().deleteRow().run()],
            ['Delete Col', () => editor.chain().focus().deleteColumn().run()],
            ['Delete Table', () => editor.chain().focus().deleteTable().run()],
          ].map(([label, fn]) => (
            <button key={label as string} onClick={() => { (fn as () => void)(); setOpen(false); }}
              className="text-left px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-soft-white/60 hover:text-accent hover:bg-white/[0.04] transition-subtle"
            >{label as string}</button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Search & Replace panel ───────────────────────────── */

export const SearchReplacePanel = ({ editor, open, onClose }: { editor: Editor; open: boolean; onClose: () => void }) => {
  const [search, setSearch] = useState('');
  const [replace, setReplace] = useState('');
  const [count, setCount] = useState(0);

  const doSearch = useCallback(() => {
    if (!search) { setCount(0); return; }
    const text = editor.getText();
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex);
    setCount(matches ? matches.length : 0);
  }, [search, editor]);

  const doReplace = () => {
    if (!search) return;
    const html = editor.getHTML();
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    editor.commands.setContent(html.replace(regex, replace));
    doSearch();
  };

  const doReplaceAll = () => {
    if (!search) return;
    const html = editor.getHTML();
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    editor.commands.setContent(html.replace(regex, replace));
    setCount(0);
  };

  if (!open) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 border border-border-subtle bg-[#0A0A0A]/95 backdrop-blur-md mb-2">
      <Search size={14} className="text-soft-white/30" />
      <input value={search} onChange={e => setSearch(e.target.value)} onKeyUp={doSearch}
        placeholder="Find..." className="h-7 px-2 bg-white/[0.04] border border-border-subtle text-sm text-soft-white/80 placeholder:text-soft-white/20 focus:outline-none focus:border-accent/40 w-40 font-mono text-xs" />
      <Replace size={14} className="text-soft-white/30" />
      <input value={replace} onChange={e => setReplace(e.target.value)}
        placeholder="Replace..." className="h-7 px-2 bg-white/[0.04] border border-border-subtle text-sm text-soft-white/80 placeholder:text-soft-white/20 focus:outline-none focus:border-accent/40 w-40 font-mono text-xs" />
      <span className="text-[10px] font-mono text-soft-white/40">{count} found</span>
      <button onClick={doReplace} className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider border border-border-subtle text-soft-white/50 hover:text-accent hover:border-accent/40 transition-subtle">Replace</button>
      <button onClick={doReplaceAll} className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider border border-border-subtle text-soft-white/50 hover:text-accent hover:border-accent/40 transition-subtle">All</button>
      <button onClick={onClose} className="ml-auto text-soft-white/30 hover:text-soft-white text-xs">✕</button>
    </div>
  );
};
