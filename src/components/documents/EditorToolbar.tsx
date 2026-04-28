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

/* ── Tiny reusable pieces ─────────────────────────────── */

export const TBtn = ({ onClick, active, icon: Icon, title, disabled }: {
  onClick: () => void; active?: boolean; icon: any; title?: string; disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2.5 transition-subtle hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed ${active ? 'text-[#4ade80] bg-[#4ade80]/10' : 'text-soft-white/40'}`}
  >
    <Icon size={16} strokeWidth={active ? 2.5 : 2} />
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
        else editor.chain().focus().toggleHeading({ level: v as 1 | 2 | 3 | 4 }).run();
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
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
];

export const FontFamilySelect = ({ editor }: { editor: Editor }) => (
  <select
    value={editor.getAttributes('textStyle').fontFamily || ''}
    onChange={e => {
      const v = e.target.value;
      if (v) {
        editor.chain().focus().setFontFamily(v).run();
      } else {
        try {
          editor.chain().focus().unsetFontFamily().run();
        } catch {
          editor.chain().focus().setFontFamily('').run();
        }
      }
    }}
    className="h-8 px-2 bg-transparent border border-border-subtle text-soft-white/60 font-mono text-[10px] uppercase tracking-wider focus:outline-none focus:border-accent/40 cursor-pointer max-w-[130px]"
  >
    {FONTS.map(f => <option key={f.value} value={f.value} className="bg-[#1a1a1a]">{f.label}</option>)}
  </select>
);

/* ── Shared color swatch grid ─────────────────────────── */

const ColorGrid = ({
  colors,
  onSelect,
  onClear,
  clearLabel = '✕',
}: {
  colors: string[];
  onSelect: (c: string) => void;
  onClear: () => void;
  clearLabel?: string;
}) => (
  <div className="p-2 bg-[#1a1a1a] border border-border-subtle z-[100] shadow-2xl rounded-md">
    <div className="grid grid-cols-5 gap-1 mb-1.5">
      {colors.map(c => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          title={c}
          className="w-6 h-6 rounded-sm border border-white/10 hover:scale-110 transition-transform"
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
    <button
      onClick={onClear}
      className="w-full text-[9px] font-mono uppercase tracking-wider text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-sm py-1 transition-colors"
    >
      {clearLabel}
    </button>
  </div>
);

/* ── Highlight color picker ───────────────────────────── */

const HL_COLORS = [
  '#fde047', '#86efac', '#7dd3fc', '#c4b5fd', '#fda4af',
  '#fdba74', '#67e8f9', '#a3e635', '#f9a8d4', '#FFFFFF',
];

export const HighlightPicker = ({ editor }: { editor: Editor }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <TBtn
        onClick={() => setOpen(!open)}
        active={editor.isActive('highlight')}
        icon={Highlighter}
        title="Highlight color"
      />
      {open && (
        <div className="absolute top-full left-0 mt-1">
          <ColorGrid
            colors={HL_COLORS}
            onSelect={c => { editor.chain().focus().toggleHighlight({ color: c }).run(); setOpen(false); }}
            onClear={() => { editor.chain().focus().unsetHighlight().run(); setOpen(false); }}
            clearLabel="Remove highlight"
          />
        </div>
      )}
    </div>
  );
};

/* ── Text (font) color picker ─────────────────────────── */
// FIX: Was using TColor from @tiptap/extension-color but the active-state check
// was unreliable. Now we read getAttributes('textStyle').color directly, show a
// live color indicator under the Palette icon, and support a native color input
// for custom colors in addition to the preset swatches.

const TXT_COLORS = [
  // Row 1 — vivid
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
  // Row 2 — muted / dark
  '#8b5cf6', '#ec4899', '#0f172a', '#374151', '#6b7280',
  // Row 3 — light / special
  '#d1fae5', '#dbeafe', '#fef3c7', '#fce7f3', '#f3f4f6',
];

export const TextColorPicker = ({ editor }: { editor: Editor }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const nativeInputRef = useRef<HTMLInputElement>(null);

  const currentColor: string = editor.getAttributes('textStyle').color || '';

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const applyColor = (c: string) => {
    editor.chain().focus().setColor(c).run();
    setOpen(false);
  };

  const clearColor = () => {
    editor.chain().focus().unsetColor().run();
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Button with live color indicator strip at bottom */}
      <button
        onClick={() => setOpen(!open)}
        title="Font color"
        className={`relative p-2.5 transition-subtle hover:bg-white/[0.06] flex flex-col items-center gap-0.5 ${open ? 'text-[#4ade80] bg-[#4ade80]/10' : 'text-soft-white/40'}`}
      >
        <Palette size={16} strokeWidth={open ? 2.5 : 2} />
        {/* Live color swatch strip */}
        <span
          className="w-4 h-1 rounded-full block"
          style={{ backgroundColor: currentColor || 'transparent', border: currentColor ? 'none' : '1px solid rgba(255,255,255,0.15)' }}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-[100]">
          <div className="p-2 bg-[#1a1a1a] border border-border-subtle shadow-2xl rounded-md min-w-[160px]">
            {/* Preset swatches */}
            <div className="grid grid-cols-5 gap-1 mb-2">
              {TXT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => applyColor(c)}
                  title={c}
                  className={`w-6 h-6 rounded-sm border hover:scale-110 transition-transform ${currentColor.toUpperCase() === c.toUpperCase() ? 'border-white ring-1 ring-white/50' : 'border-white/10'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            {/* Custom color row */}
            <div className="flex items-center gap-2 mb-1.5 px-0.5">
              <span className="text-[9px] font-mono uppercase tracking-wider text-white/30 flex-shrink-0">
                Custom
              </span>
              <div className="relative flex-1">
                <input
                  ref={nativeInputRef}
                  type="color"
                  defaultValue={currentColor || '#000000'}
                  onChange={e => editor.chain().focus().setColor(e.target.value).run()}
                  onBlur={() => setOpen(false)}
                  className="w-full h-6 cursor-pointer rounded-sm border border-white/10 bg-transparent"
                  title="Pick custom color"
                />
              </div>
            </div>

            {/* Clear button */}
            <button
              onClick={clearColor}
              className="w-full text-[9px] font-mono uppercase tracking-wider text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-sm py-1 transition-colors"
            >
              Remove color
            </button>
          </div>
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
        if (result) (editor.chain().focus() as any).setImage({ src: result }).run();
      };
      reader.readAsDataURL(file);
    }
    if (event.target) event.target.value = '';
  };

  return (
    <>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      <TBtn onClick={() => fileInputRef.current?.click()} icon={ImageIcon} title="Upload Image" />
    </>
  );
};

/* ── Table controls ───────────────────────────────────── */

export const TableControls = ({ editor }: { editor: Editor }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <TBtn onClick={() => setOpen(!open)} active={editor.isActive('table')} icon={TableIcon} title="Table" />
      {open && (
        <div className="absolute top-full left-0 mt-1 p-1 bg-[#1a1a1a] border border-border-subtle flex flex-col gap-0.5 z-[100] shadow-2xl rounded-md min-w-[160px]">
          {([
            ['Insert 3×3 Table', () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()],
            ['---'],
            ['Add Row Above', () => editor.chain().focus().addRowBefore().run()],
            ['Add Row Below', () => editor.chain().focus().addRowAfter().run()],
            ['Add Column Before', () => editor.chain().focus().addColumnBefore().run()],
            ['Add Column After', () => editor.chain().focus().addColumnAfter().run()],
            ['---'],
            ['Delete Row', () => editor.chain().focus().deleteRow().run()],
            ['Delete Column', () => editor.chain().focus().deleteColumn().run()],
            ['Delete Table', () => editor.chain().focus().deleteTable().run()],
          ] as [string, (() => void) | string][]).map(([label, fn], i) => (
            label === '---' ? (
              <div key={i} className="h-px bg-white/10 my-1 mx-2" />
            ) : (
              <button key={label} onClick={() => { (fn as () => void)(); setOpen(false); }}
                className="text-left px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-soft-white/60 hover:text-[#4ade80] hover:bg-white/[0.04] transition-subtle rounded-sm"
              >{label}</button>
            )
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
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState('');

  const buildRegex = useCallback((flags = 'gi') => {
    if (!search) return null;
    try {
      return new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    } catch {
      return null;
    }
  }, [search]);

  const doCount = useCallback(() => {
    if (!search.trim()) { setCount(null); return; }
    const text = editor.getText();
    const rx = buildRegex('gi');
    if (!rx) { setCount(0); return; }
    setCount((text.match(rx) || []).length);
  }, [search, editor, buildRegex]);

  const safeReplace = (replaceAll: boolean) => {
    setError('');
    if (!search.trim()) return;
    const rx = buildRegex(replaceAll ? 'gi' : 'i');
    if (!rx) { setError('Invalid search term'); return; }

    const dom = new DOMParser().parseFromString(editor.getHTML(), 'text/html');
    let replaced = 0;

    const walkAndReplace = (node: Node): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        const orig = node.textContent || '';
        if (rx.test(orig)) {
          rx.lastIndex = 0;
          node.textContent = orig.replace(rx, replace);
          replaced++;
          if (!replaceAll) return true;
        }
        return false;
      }
      for (const child of Array.from(node.childNodes)) {
        if (walkAndReplace(child) && !replaceAll) return true;
      }
      return false;
    };

    walkAndReplace(dom.body);

    if (replaced > 0) {
      editor.commands.setContent(dom.body.innerHTML);
    }

    setTimeout(() => doCount(), 50);
  };

  if (!open) return null;

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 border border-border-subtle bg-[#0A0A0A]/95 backdrop-blur-md mb-2">
      <Search size={14} className="text-soft-white/30" />
      <input
        value={search}
        onChange={e => { setSearch(e.target.value); setCount(null); }}
        onKeyUp={doCount}
        placeholder="Find..."
        className="h-7 px-2 bg-white/[0.04] border border-border-subtle text-sm text-soft-white/80 placeholder:text-soft-white/20 focus:outline-none focus:border-accent/40 w-40 font-mono text-xs"
      />
      <Replace size={14} className="text-soft-white/30" />
      <input
        value={replace}
        onChange={e => setReplace(e.target.value)}
        placeholder="Replace with..."
        className="h-7 px-2 bg-white/[0.04] border border-border-subtle text-sm text-soft-white/80 placeholder:text-soft-white/20 focus:outline-none focus:border-accent/40 w-40 font-mono text-xs"
      />
      {count !== null && (
        <span className="text-[10px] font-mono text-soft-white/40">
          {count === 0 ? 'no matches' : `${count} found`}
        </span>
      )}
      {error && <span className="text-[10px] font-mono text-red-400">{error}</span>}
      <button onClick={() => safeReplace(false)}
        className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider border border-border-subtle text-soft-white/50 hover:text-accent hover:border-accent/40 transition-subtle">
        Replace
      </button>
      <button onClick={() => safeReplace(true)}
        className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider border border-border-subtle text-soft-white/50 hover:text-accent hover:border-accent/40 transition-subtle">
        All
      </button>
      <button onClick={onClose} className="ml-auto text-soft-white/30 hover:text-soft-white text-xs">✕</button>
    </div>
  );
};