"use client";

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import TColor from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Link from '@tiptap/extension-link';
import ImageResize from 'tiptap-extension-resize-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import FontFamily from '@tiptap/extension-font-family';

import {
  Download, Upload, Bold, Italic, List, ListOrdered, Quote, Minus, Code,
  Strikethrough, RotateCcw, RotateCw, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, Underline as UnderlineIcon, Search, Maximize, Minimize,
  Printer, FileDown, ListChecks, Subscript as SubIcon, Superscript as SupIcon,
  Pilcrow,
} from 'lucide-react';
import '@tiptap/extension-image';
import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType } from 'docx';
import { downloadBlob } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';

// Helper to convert base64 to Uint8Array for docx
function base64ToUint8Array(base64: string) {
  const binaryString = window.atob(base64.split(',')[1]);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
import {
  TBtn, TDivider, HeadingSelect, FontFamilySelect,
  HighlightPicker, TextColorPicker, LinkButton, ImageButton,
  TableControls, SearchReplacePanel,
} from './EditorToolbar';

export default function WordEditor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      TColor,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-accent underline cursor-pointer' } }),
      ImageResize.configure({ inline: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder: 'Start typing your document…' }),
      CharacterCount,
      Typography,
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      FontFamily,
    ],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[600px] p-6 md:p-12 focus:outline-none border border-border-subtle bg-white/[0.01] font-sans selection:bg-accent/30',
      },
    },
  });

  /* ── Keyboard shortcuts ─────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') { e.preventDefault(); setShowSearch(s => !s); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') { e.preventDefault(); handlePrint(); }
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFullscreen]);

  /* ── Drag-drop import ───────────────────────────────── */
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      editor?.commands.setContent(result.value);
    }
  }, [editor]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, noClick: true,
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
  });

  /* ── Export DOCX ────────────────────────────────────── */
  const getDocxImageType = (src: string): 'png' | 'jpg' | 'gif' | 'bmp' => {
    const match = src.match(/^data:image\/(\w+);/);
    if (!match) return 'png';
    const mime = match[1].toLowerCase();
    if (mime === 'jpeg' || mime === 'jpg') return 'jpg';
    if (mime === 'gif') return 'gif';
    if (mime === 'bmp') return 'bmp';
    return 'png'; // webp → png (docx doesn't support webp)
  };

  // Load a real Image to get intrinsic pixel dimensions (not CSS display size)
  const getIntrinsicSize = (src: string): Promise<{ w: number; h: number }> =>
    new Promise(resolve => {
      const img = new Image();
      img.onload  = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 600, h: 400 });
      img.src = src;
    });

  // Scale down only if wider than page content area, never upscale
  const capToPageWidth = (w: number, h: number, maxW = 624) => {
    if (w <= maxW) return { width: w, height: h };
    const scale = maxW / w;
    return { width: maxW, height: Math.round(h * scale) };
  };

  // Read text-align from DOM element and map to docx AlignmentType
  const getAlignmentFromEl = (el: Element | null) => {
    const align = el?.getAttribute('style')?.match(/text-align:\s*(\w+)/)?.[1]
      || (el as HTMLElement)?.style?.textAlign;
    switch (align) {
      case 'center':  return AlignmentType.CENTER;
      case 'right':   return AlignmentType.RIGHT;
      case 'justify': return AlignmentType.BOTH;
      default:        return AlignmentType.LEFT;
    }
  };

  const handleExport = async () => {
    if (!editor) return;

    // Parse from HTML — immune to TipTap node-type naming differences across extensions
    const dom = new DOMParser().parseFromString(editor.getHTML(), 'text/html');
    const children: any[] = [];

    // Build an ImageRun paragraph; parentEl provides alignment context
    const makeImgParagraph = async (img: HTMLImageElement, parentEl?: Element): Promise<any | null> => {
      const src = img.src;
      if (!src?.startsWith('data:')) return null;
      try {
        const buffer = base64ToUint8Array(src);
        const imgType = getDocxImageType(src);
        const { w, h } = await getIntrinsicSize(src);
        const { width, height } = capToPageWidth(w, h);
        return new Paragraph({
          alignment: getAlignmentFromEl(parentEl ?? img.parentElement),
          children: [new ImageRun({ data: buffer, transformation: { width, height }, type: imgType } as any)],
        });
      } catch (e) {
        console.error('Image export failed', e);
        return null;
      }
    };

    const processElement = async (el: Element) => {
      const tag = el.tagName.toLowerCase();

      // Standalone <img>
      if (tag === 'img') {
        const p = await makeImgParagraph(el as HTMLImageElement, el.parentElement ?? undefined);
        if (p) children.push(p);
        return;
      }

      const imgs = Array.from(el.querySelectorAll('img'));

      if (imgs.length > 0) {
        // Elements containing images — emit each image as its own block paragraph
        for (const img of imgs) {
          const p = await makeImgParagraph(img as HTMLImageElement, el);
          if (p) children.push(p);
        }
        // Emit surrounding text after removing img tags
        imgs.forEach(img => img.remove());
        const text = el.textContent?.trim();
        if (text) children.push(new Paragraph({ children: [new TextRun(text)] }));
        return;
      }

      // Plain text / formatted paragraph — walk child nodes preserving inline formatting
      const runs: any[] = [];
      el.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          const t = child.textContent || '';
          if (t) runs.push(new TextRun(t));
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const c = child as Element;
          const ct = c.tagName.toLowerCase();
          runs.push(new TextRun({
            text:        c.textContent || '',
            bold:        ct === 'strong' || ct === 'b',
            italics:     ct === 'em'     || ct === 'i',
            underline:   ct === 'u' ? {} : undefined,
            strike:      ct === 's'      || ct === 'del',
            superScript: ct === 'sup',
            subScript:   ct === 'sub',
          }));
        }
      });
      if (runs.length > 0) {
        children.push(new Paragraph({ children: runs }));
      } else if (el.textContent?.trim()) {
        children.push(new Paragraph({ children: [new TextRun(el.textContent)] }));
      } else {
        children.push(new Paragraph({ children: [new TextRun('')] }));
      }
    };

    // Sequential await — preserves document order and avoids race conditions
    for (const child of Array.from(dom.body.children)) {
      await processElement(child);
    }

    if (children.length === 0) {
      children.push(new Paragraph({ children: [new TextRun('Empty document')] }));
    }

    const doc = new Document({ sections: [{ properties: {}, children }] });
    const blob = await Packer.toBlob(doc);
    downloadBlob(blob, 'document.docx');
  };


  /* ── Export HTML ─────────────────────────────────────── */
  const handleExportHTML = () => {
    if (!editor) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title><style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px}th{background:#f5f5f5}img{display:block;max-width:100%;height:auto;margin:1em 0}</style></head><body>${editor.getHTML()}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    downloadBlob(blob, 'document.html');
  };

  /* ── Print ───────────────────────────────────────────── */
  const handlePrint = () => {
    if (!editor) return;
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Print</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.7; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #ccc; padding: 8px; }
    img { display: block !important; max-width: 100% !important; height: auto !important; margin: 1em 0 !important; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  ${editor.getHTML()}
  <script>
    window.addEventListener('load', function () {
      var images = Array.from(document.getElementsByTagName('img'));
      if (images.length === 0) { setTimeout(function(){ window.print(); }, 300); return; }
      var remaining = images.length;
      function onDone() { if (--remaining <= 0) setTimeout(function(){ window.print(); }, 300); }
      images.forEach(function(img) {
        if (img.complete && img.naturalWidth > 0) { onDone(); }
        else { img.addEventListener('load', onDone, {once:true}); img.addEventListener('error', onDone, {once:true}); }
      });
    });
  <\/script>
</body>
</html>`;
    // Use Blob URL — document.write() silently truncates large base64 data URIs in Chrome/Safari
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Revoke after generous delay so the window has finished loading
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  /* ── Clear ───────────────────────────────────────────── */
  const handleClear = () => {
    if (window.confirm('Clear all content?')) editor?.commands.clearContent();
  };

  if (!editor) return null;

  const chars = editor.storage.characterCount.characters();
  const words = editor.storage.characterCount.words();

  const wrapperClass = isFullscreen
    ? 'fixed inset-0 z-[200] bg-[#0e0e0e] overflow-auto p-6 lg:p-12'
    : 'max-w-5xl mx-auto';

  return (
    <div ref={containerRef} className={wrapperClass} {...getRootProps()}>
      <input {...getInputProps()} />

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 border-b border-border-subtle pb-6">
        <div>
          <h2 className="text-4xl font-heading font-bold tracking-tight mb-2">Word Editor</h2>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase text-accent font-bold tracking-[0.2em]">
              {isDragActive ? '[ Ready to import ]' : '[ Offline Build ]'}
            </span>
            <div className="w-1 h-1 rounded-full bg-soft-white/20" />
            <p className="font-mono text-[10px] uppercase text-soft-white/40 tracking-widest">
              DOCX • HTML • Print
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => fileInputRef.current?.click()}
            className="h-10 px-5 border border-border-subtle font-mono text-[10px] uppercase tracking-widest text-soft-white/60 hover:text-accent hover:border-accent/40 transition-subtle flex items-center gap-2">
            <Upload size={13} /> Import
          </button>
          <button onClick={handleExport}
            className="h-10 px-5 bg-accent text-primary-bg font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-accent/80 transition-subtle flex items-center gap-2">
            <Download size={13} /> .docx
          </button>
          <button onClick={handleExportHTML}
            className="h-10 px-5 border border-border-subtle font-mono text-[10px] uppercase tracking-widest text-soft-white/60 hover:text-accent hover:border-accent/40 transition-subtle flex items-center gap-2">
            <FileDown size={13} /> .html
          </button>
          <button onClick={handlePrint}
            className="h-10 px-5 border border-border-subtle font-mono text-[10px] uppercase tracking-widest text-soft-white/60 hover:text-accent hover:border-accent/40 transition-subtle flex items-center gap-2">
            <Printer size={13} /> Print
          </button>
        </div>
      </div>

      {/* ── Toolbar Row 1: Text formatting ──────────────── */}
      <div className="sticky top-16 z-30 border border-border-subtle bg-[#0A0A0A]/95 backdrop-blur-md mb-1 overflow-hidden">
        <div className="flex flex-nowrap items-center gap-0.5 p-1 overflow-x-auto no-scrollbar">
          <HeadingSelect editor={editor} />
          <FontFamilySelect editor={editor} />
          <TDivider />
          <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={Bold} title="Bold" />
          <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={Italic} title="Italic" />
          <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} icon={UnderlineIcon} title="Underline" />
          <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} icon={Strikethrough} title="Strikethrough" />
          <TBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} icon={Code} title="Inline Code" />
          <TBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} icon={SubIcon} title="Subscript" />
          <TBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} icon={SupIcon} title="Superscript" />
          <TDivider />
          <HighlightPicker editor={editor} />
          <TextColorPicker editor={editor} />
          <TDivider />
          <LinkButton editor={editor} />
          <ImageButton editor={editor} />
          <TableControls editor={editor} />
        </div>

        {/* ── Toolbar Row 2: Alignment, lists, utilities ── */}
        <div className="flex flex-nowrap items-center gap-0.5 p-1 border-t border-border-subtle/50 overflow-x-auto no-scrollbar">
          <TBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} icon={AlignLeft} title="Align Left" />
          <TBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} icon={AlignCenter} title="Align Center" />
          <TBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} icon={AlignRight} title="Align Right" />
          <TBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} icon={AlignJustify} title="Justify" />
          <TDivider />
          <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={List} title="Bullet List" />
          <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} icon={ListOrdered} title="Ordered List" />
          <TBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} icon={ListChecks} title="Task List" />
          <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} icon={Quote} title="Blockquote" />
          <TBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={Minus} title="Horizontal Rule" />
          <TBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} icon={Code} title="Code Block" />
          <TDivider />
          <TBtn onClick={() => editor.chain().focus().undo().run()} icon={RotateCcw} title="Undo" disabled={!editor.can().undo()} />
          <TBtn onClick={() => editor.chain().focus().redo().run()} icon={RotateCw} title="Redo" disabled={!editor.can().redo()} />
          <TDivider />
          <TBtn onClick={() => setShowSearch(s => !s)} active={showSearch} icon={Search} title="Search & Replace (⌘F)" />
          <TBtn onClick={handleClear} icon={Pilcrow} title="Clear Content" />

          <div className="ml-auto flex items-center gap-3">
            <span className="font-mono text-[9px] text-soft-white/30 uppercase tracking-wider">
              {words} words · {chars} chars
            </span>
            <TBtn onClick={() => setIsFullscreen(f => !f)} icon={isFullscreen ? Minimize : Maximize} title="Toggle Fullscreen" />
          </div>
        </div>
      </div>

      {/* ── Search & Replace ────────────────────────────── */}
      <SearchReplacePanel editor={editor} open={showSearch} onClose={() => setShowSearch(false)} />

      {/* ── Drag overlay ────────────────────────────────── */}
      {isDragActive && (
        <div className="absolute inset-0 z-20 bg-accent/5 border-2 border-dashed border-accent/40 flex items-center justify-center pointer-events-none">
          <span className="font-mono text-sm text-accent uppercase tracking-widest">Drop .docx file here</span>
        </div>
      )}

      {/* ── Editor ──────────────────────────────────────── */}
      <EditorContent editor={editor} />

      <input type="file" ref={fileInputRef} className="hidden" accept=".docx"
        onChange={e => { const file = e.target.files?.[0]; if (file) onDrop([file]); }} />
    </div>
  );
}
