"use client";

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
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
import mammoth from 'mammoth';
import {
  Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, HeadingLevel,
  Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxTableCell,
  WidthType, BorderStyle, TableLayoutType,
} from 'docx';
import { downloadBlob } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';

import {
  TBtn, TDivider, HeadingSelect, FontFamilySelect,
  HighlightPicker, TextColorPicker, LinkButton, ImageButton,
  TableControls, SearchReplacePanel,
} from './EditorToolbar';

// ── Helpers ────────────────────────────────────────────────────────────────

function base64ToUint8Array(base64: string) {
  const binaryString = window.atob(base64.split(',')[1]);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

const getDocxImageType = (src: string): 'png' | 'jpg' | 'gif' | 'bmp' => {
  const match = src.match(/^data:image\/(\w+);/);
  if (!match) return 'png';
  const mime = match[1].toLowerCase();
  if (mime === 'jpeg' || mime === 'jpg') return 'jpg';
  if (mime === 'gif') return 'gif';
  if (mime === 'bmp') return 'bmp';
  return 'png';
};

const getIntrinsicSize = (src: string): Promise<{ w: number; h: number }> =>
  new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ w: 600, h: 400 });
    img.src = src;
  });

const capToPageWidth = (w: number, h: number, maxW = 624) => {
  if (w <= maxW) return { width: w, height: h };
  const scale = maxW / w;
  return { width: maxW, height: Math.round(h * scale) };
};

const getAlignmentFromEl = (el: Element | null): typeof AlignmentType[keyof typeof AlignmentType] => {
  const style = (el as HTMLElement)?.style?.textAlign
    || el?.getAttribute('style')?.match(/text-align:\s*(\w+)/)?.[1]
    || '';
  switch (style) {
    case 'center': return AlignmentType.CENTER;
    case 'right': return AlignmentType.RIGHT;
    case 'justify': return AlignmentType.BOTH;
    default: return AlignmentType.LEFT;
  }
};

const parseColor = (color: string): string | undefined => {
  if (!color) return undefined;
  const trimmed = color.trim();
  if (trimmed.startsWith('#')) return trimmed.replace('#', '').toUpperCase();
  const match = trimmed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return [match[1], match[2], match[3]]
      .map(n => parseInt(n).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  }
  return undefined;
};

// Block-level tags that should NOT be recursed into as inline content.
const BLOCK_TAGS = new Set([
  'p', 'div', 'section', 'article', 'header', 'footer', 'main', 'aside',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'dt', 'dd', 'blockquote', 'figure',
  'figcaption', 'address', 'pre', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
]);

// ── Recursive inline → TextRun walker ─────────────────────────────────────
const getRuns = (node: Node, currentStyles: Record<string, any> = {}): TextRun[] => {
  const runs: TextRun[] = [];
  const children = Array.from(node.childNodes);

  children.forEach((child, idx) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent || '';
      if (text) runs.push(new TextRun({ text, ...currentStyles }));
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;

    const el = child as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const style = el.getAttribute('style') || '';
    const newStyles = { ...currentStyles };

    if (tag === 'input' || tag === 'button') return;

    if (BLOCK_TAGS.has(tag)) {
      if (idx > 0 && runs.length > 0) {
        runs.push(new TextRun({ break: 1, ...currentStyles }));
      }
      runs.push(...getRuns(el, newStyles));
      return;
    }

    if (tag === 'strong' || tag === 'b') newStyles.bold = true;
    if (tag === 'em' || tag === 'i') newStyles.italics = true;
    if (tag === 'u') newStyles.underline = {};
    if (tag === 's' || tag === 'del' || tag === 'strike') newStyles.strike = true;
    if (tag === 'sup') newStyles.superScript = true;
    if (tag === 'sub') newStyles.subScript = true;
    if (tag === 'code') {
      newStyles.font = 'Courier New';
      newStyles.size = newStyles.size || 18;
    }
    if (tag === 'mark') {
      const bgColor = el.style.backgroundColor || el.getAttribute('data-color') || 'FFFF00';
      const parsed = parseColor(bgColor);
      newStyles.shading = { type: 'clear', fill: parsed || 'FFFF00' };
    }
    if (tag === 'br') {
      runs.push(new TextRun({ break: 1 }));
      return;
    }
    if (tag === 'a') {
      newStyles.underline = {};
      newStyles.color = newStyles.color || '1155CC';
    }

    const colorMatch = style.match(/(?:^|;)\s*color:\s*([^;]+)/);
    if (colorMatch) {
      const c = parseColor(colorMatch[1].trim());
      if (c) newStyles.color = c;
    }
    const bgMatch = style.match(/background-color:\s*([^;]+)/);
    if (bgMatch) {
      const c = parseColor(bgMatch[1].trim());
      if (c) newStyles.shading = { type: 'clear', fill: c };
    }
    const sizeMatch = style.match(/font-size:\s*([\d.]+)px/);
    if (sizeMatch) newStyles.size = Math.round(parseFloat(sizeMatch[1]) * 2);
    const fontMatch = style.match(/font-family:\s*([^;]+)/);
    if (fontMatch) newStyles.font = fontMatch[1].split(',')[0].replace(/['"]/g, '').trim();
    const boldMatch = style.match(/font-weight:\s*(\d+|bold)/);
    if (boldMatch) {
      const w = boldMatch[1];
      newStyles.bold = w === 'bold' || parseInt(w) >= 600;
    }

    runs.push(...getRuns(el, newStyles));
  });
  return runs;
};

// ── FIXED: Extract plain text runs from a cell element ───────────────────
// This avoids the BLOCK_TAGS break injection that causes vertical text.
// For table cells we flatten all nested block elements into a single
// paragraph, using real newlines only when the cell has multiple <p> blocks.
const getCellParagraphs = (
  tdEl: HTMLElement,
  isHeader: boolean,
): Paragraph[] => {
  // tiptap wraps content in <p> tags inside td/th
  const paragraphEls = Array.from(tdEl.querySelectorAll(':scope > p')) as HTMLElement[];

  if (paragraphEls.length > 0) {
    return paragraphEls.map(p => {
      // For each <p>, extract inline runs only (no BLOCK_TAGS processing)
      const runs = getInlineRuns(p, isHeader ? { bold: true } : {});
      return new Paragraph({
        children: runs.length ? runs : [new TextRun({ text: '', ...(isHeader ? { bold: true } : {}) })],
        spacing: { before: 60, after: 60 },
      });
    });
  }

  // No <p> wrappers — extract directly
  const runs = getInlineRuns(tdEl, isHeader ? { bold: true } : {});
  return [new Paragraph({
    children: runs.length ? runs : [new TextRun({ text: '', ...(isHeader ? { bold: true } : {}) })],
    spacing: { before: 60, after: 60 },
  })];
};

// ── Inline-only run extractor (no block-tag line-break injection) ─────────
// Used for table cells where we handle paragraph structure separately above.
const getInlineRuns = (node: Node, currentStyles: Record<string, any> = {}): TextRun[] => {
  const runs: TextRun[] = [];

  node.childNodes.forEach(child => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent || '';
      if (text) runs.push(new TextRun({ text, ...currentStyles }));
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;

    const el = child as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const style = el.getAttribute('style') || '';
    const newStyles = { ...currentStyles };

    if (tag === 'input' || tag === 'button') return;

    // For block-level children inside a cell (e.g. nested <p>),
    // just recurse into their children without inserting breaks.
    if (BLOCK_TAGS.has(tag)) {
      runs.push(...getInlineRuns(el, newStyles));
      return;
    }

    if (tag === 'strong' || tag === 'b') newStyles.bold = true;
    if (tag === 'em' || tag === 'i') newStyles.italics = true;
    if (tag === 'u') newStyles.underline = {};
    if (tag === 's' || tag === 'del' || tag === 'strike') newStyles.strike = true;
    if (tag === 'sup') newStyles.superScript = true;
    if (tag === 'sub') newStyles.subScript = true;
    if (tag === 'code') {
      newStyles.font = 'Courier New';
      newStyles.size = newStyles.size || 18;
    }
    if (tag === 'mark') {
      const bgColor = el.style.backgroundColor || el.getAttribute('data-color') || 'FFFF00';
      const parsed = parseColor(bgColor);
      newStyles.shading = { type: 'clear', fill: parsed || 'FFFF00' };
    }
    if (tag === 'br') {
      runs.push(new TextRun({ break: 1 }));
      return;
    }
    if (tag === 'a') {
      newStyles.underline = {};
      newStyles.color = newStyles.color || '1155CC';
    }

    const colorMatch = style.match(/(?:^|;)\s*color:\s*([^;]+)/);
    if (colorMatch) {
      const c = parseColor(colorMatch[1].trim());
      if (c) newStyles.color = c;
    }
    const bgMatch = style.match(/background-color:\s*([^;]+)/);
    if (bgMatch) {
      const c = parseColor(bgMatch[1].trim());
      if (c) newStyles.shading = { type: 'clear', fill: c };
    }
    const sizeMatch = style.match(/font-size:\s*([\d.]+)px/);
    if (sizeMatch) newStyles.size = Math.round(parseFloat(sizeMatch[1]) * 2);
    const fontMatch = style.match(/font-family:\s*([^;]+)/);
    if (fontMatch) newStyles.font = fontMatch[1].split(',')[0].replace(/['"]/g, '').trim();
    const boldMatch = style.match(/font-weight:\s*(\d+|bold)/);
    if (boldMatch) {
      const w = boldMatch[1];
      newStyles.bold = w === 'bold' || parseInt(w) >= 600;
    }

    runs.push(...getInlineRuns(el, newStyles));
  });

  return runs;
};

// ── List item → Paragraph ─────────────────────────────────────────────────
const listItemToParagraph = (
  li: HTMLElement,
  ordered: boolean,
  depth: number,
  counter: number,
  alignment: typeof AlignmentType[keyof typeof AlignmentType],
): Paragraph => {
  const runs = getRuns(li);
  const indent = { left: 720 * (depth + 1), hanging: 360 };
  return new Paragraph({
    children: runs.length ? runs : [new TextRun('')],
    alignment,
    numbering: ordered
      ? { reference: 'default-numbering', level: depth }
      : undefined,
    bullet: !ordered ? { level: depth } : undefined,
    indent,
    spacing: { before: 80, after: 80 },
  });
};

// ── Recursive list processor ───────────────────────────────────────────────
const processListElement = (
  list: HTMLElement,
  depth = 0,
  alignment: typeof AlignmentType[keyof typeof AlignmentType] = AlignmentType.LEFT,
): Paragraph[] => {
  const paragraphs: Paragraph[] = [];
  const ordered = list.tagName.toLowerCase() === 'ol';
  let counter = 1;

  list.childNodes.forEach(child => {
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const el = child as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (tag !== 'li') return;

    const nestedLists = Array.from(el.querySelectorAll(':scope > ul, :scope > ol')) as HTMLElement[];
    const liClone = el.cloneNode(true) as HTMLElement;
    liClone.querySelectorAll('ul, ol').forEach(n => n.remove());

    const runs = getRuns(liClone);
    const indent = { left: 720 * (depth + 1), hanging: 360 };

    paragraphs.push(new Paragraph({
      children: runs.length ? runs : [new TextRun('')],
      alignment,
      bullet: !ordered ? { level: depth } : undefined,
      numbering: ordered ? { reference: 'default-numbering', level: depth } : undefined,
      indent,
      spacing: { before: 80, after: 80 },
    }));

    counter++;

    nestedLists.forEach(nested => {
      paragraphs.push(...processListElement(nested, depth + 1, alignment));
    });
  });

  return paragraphs;
};

// ── Table processor ───────────────────────────────────────────────────────
// KEY FIX: Word requires BOTH layout=FIXED *and* a <w:tblGrid> with <w:gridCol>
// entries to honour explicit column widths. Without columnWidths[], the docx
// library emits gridCol w:w="100" (100 twips = ~0.07in) regardless of the
// per-cell width you set — causing severe column squishing.
const processTable = (tableEl: HTMLElement): DocxTable => {
  const rows: DocxTableRow[] = [];

  // Count actual columns per row (handle colspan later if needed)
  let maxCols = 0;
  tableEl.querySelectorAll('tr').forEach(tr => {
    const cols = tr.querySelectorAll('td, th').length;
    if (cols > maxCols) maxCols = cols;
  });
  if (maxCols === 0) maxCols = 1;

  // Letter page: 12240 twips wide, 1440 twips/inch, 1in margins each side
  // Content width = 12240 - 2*1440 = 9360, minus small padding = 9072
  const PAGE_WIDTH_TWIPS = 9072;
  const colWidth = Math.floor(PAGE_WIDTH_TWIPS / maxCols);
  // columnWidths array — one entry per column, all equal width
  const columnWidths = Array(maxCols).fill(colWidth);

  tableEl.querySelectorAll('tr').forEach(tr => {
    const cells: DocxTableCell[] = [];
    tr.querySelectorAll('td, th').forEach(td => {
      const isHeader = td.tagName.toLowerCase() === 'th';
      const tdEl = td as HTMLElement;
      const cellChildren = getCellParagraphs(tdEl, isHeader);

      cells.push(new DocxTableCell({
        children: cellChildren,
        // Must match the columnWidths entry exactly
        width: { size: colWidth, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
          bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
          left: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
          right: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
        },
        shading: isHeader ? { fill: 'E8E8E8' } : undefined,
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
      }));
    });
    if (cells.length > 0) {
      rows.push(new DocxTableRow({ children: cells }));
    }
  });

  return new DocxTable({
    rows,
    // REQUIRED: columnWidths generates <w:tblGrid><w:gridCol w:w="N"/> entries.
    // Without this, Word ignores layout=FIXED and squishes all columns to ~100 twips.
    columnWidths,
    layout: TableLayoutType.FIXED,
    width: { size: PAGE_WIDTH_TWIPS, type: WidthType.DXA },
  });
};

// ── Single image → ImageRun (not Paragraph) ───────────────────────────────
const makeImageRun = async (img: HTMLImageElement): Promise<ImageRun | null> => {
  const src = img.getAttribute('src') || img.src;
  if (!src?.startsWith('data:')) return null;
  try {
    const buffer = base64ToUint8Array(src);
    const imgType = getDocxImageType(src);
    const { w, h } = await getIntrinsicSize(src);
    // When multiple images share a paragraph, cap each to half page width
    // so they sit side-by-side without overflowing.
    // We don't know sibling count here, so we cap to 300px (~half page).
    // The caller (makeImgsParagraph) will re-cap based on actual count.
    const { width, height } = capToPageWidth(w, h);
    return new ImageRun({ data: buffer, transformation: { width, height }, type: imgType } as any);
  } catch (e) {
    console.error('Image export failed', e);
    return null;
  }
};

// ── One or more images → a single Paragraph ──────────────────────────────
// FIX: Previously each <img> became its own Paragraph, so side-by-side images
// in the editor would stack vertically in the docx.
// Now ALL <img> elements inside one parent element go into the SAME Paragraph
// as sibling ImageRun children, preserving their inline layout.
const makeImgsParagraph = async (
  imgs: HTMLImageElement[],
  parentEl?: Element | null,
): Promise<Paragraph | null> => {
  if (imgs.length === 0) return null;
  const alignment = getAlignmentFromEl(parentEl ?? imgs[0].parentElement);

  // Determine per-image max width: split page width evenly across siblings
  // with a small gap allowance (95% of share to avoid overflow).
  const PAGE_W = 624; // pts, approx letter page content width
  const perImgMaxW = Math.floor((PAGE_W / imgs.length) * 0.95);

  const runs: ImageRun[] = [];
  for (const img of imgs) {
    const src = img.getAttribute('src') || img.src;
    if (!src?.startsWith('data:')) continue;
    try {
      const buffer = base64ToUint8Array(src);
      const imgType = getDocxImageType(src);
      const { w, h } = await getIntrinsicSize(src);
      const { width, height } = capToPageWidth(w, h, perImgMaxW);
      const run = new ImageRun({ data: buffer, transformation: { width, height }, type: imgType } as any);
      runs.push(run);
    } catch (e) {
      console.error('Image export failed', e);
    }
  }

  if (runs.length === 0) return null;
  return new Paragraph({ alignment, children: runs });
};

// ── Main component ─────────────────────────────────────────────────────────

export default function WordEditor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      // FIX: disable StarterKit's built-in Heading to avoid double-registration
      // conflict that breaks isActive() detection in the toolbar dropdown.
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [1, 2, 3, 4] }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      TColor,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer' } }),
      ImageResize.configure({ inline: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      // FIX: Override TableHeader to ensure header cell text is dark/visible
      TableHeader.configure({
        HTMLAttributes: {
          class: 'table-header-cell',
        },
      }),
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
        class: [
          'prose max-w-none',
          'min-h-[1056px]',
          'p-[1in]',
          'focus:outline-none',
          'font-sans',
          'bg-white text-gray-900',
          'selection:bg-blue-200',
          'shadow-2xl',
          'border border-gray-200',
          'mx-auto',
          'w-full max-w-[8.5in]',
        ].join(' '),
      },
    },
  });

  const isFullscreenRef = useRef(isFullscreen);
  useEffect(() => { isFullscreenRef.current = isFullscreen; }, [isFullscreen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') { e.preventDefault(); setShowSearch(s => !s); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') { e.preventDefault(); handlePrint(); }
      if (e.key === 'Escape' && isFullscreenRef.current) setIsFullscreen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Drag-drop import ─────────────────────────────── */
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (file.name.endsWith('.docx') || file.type.includes('wordprocessingml')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      editor?.commands.setContent(result.value);
    }
  }, [editor]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
  });

  /* ── Export DOCX ──────────────────────────────────── */
  const handleExport = async () => {
    if (!editor) return;

    const dom = new DOMParser().parseFromString(editor.getHTML(), 'text/html');
    const children: any[] = [];

    const processElement = async (el: Element, extraIndent = 0): Promise<void> => {
      const tag = el.tagName.toLowerCase();
      const alignment = getAlignmentFromEl(el);

      // Standalone <img> at top level
      if (tag === 'img') {
        const p = await makeImgsParagraph([el as HTMLImageElement], el.parentElement);
        if (p) children.push(p);
        return;
      }

      if (tag === 'table') {
        children.push(processTable(el as HTMLElement));
        return;
      }

      if (tag === 'ul' || tag === 'ol') {
        children.push(...processListElement(el as HTMLElement, 0, alignment));
        return;
      }

      if (tag === 'pre') {
        const codeEl = el.querySelector('code') ?? el;
        const text = codeEl.textContent || '';
        text.split('\n').forEach(line => {
          children.push(new Paragraph({
            children: [new TextRun({ text: line || ' ', font: 'Courier New', size: 18 })],
            indent: { left: 720 },
            spacing: { before: 0, after: 0 },
          }));
        });
        return;
      }

      if (tag === 'hr') {
        children.push(new Paragraph({ thematicBreak: true }));
        return;
      }

      if (tag === 'blockquote') {
        for (const child of Array.from(el.children)) {
          await processElement(child, 720);
        }
        return;
      }

      // ── FIX: gather ALL <img> inside this element FIRST ──────────────────
      // When a <p> contains multiple inline images (side-by-side in editor),
      // they must all go into ONE Paragraph as sibling ImageRuns.
      // Old code put each img into its own Paragraph → stacked vertically.
      const allImgs = Array.from(el.querySelectorAll('img')) as HTMLImageElement[];

      if (allImgs.length > 0) {
        // All images in this container → single paragraph, preserving alignment
        const imgPara = await makeImgsParagraph(allImgs, el);
        if (imgPara) children.push(imgPara);

        // Clone el and strip images to process remaining text content
        const elClone = el.cloneNode(true) as HTMLElement;
        elClone.querySelectorAll('img').forEach(i => i.remove());

        // Only add text paragraph if there's meaningful text content left
        const textContent = elClone.textContent?.trim() || '';
        if (textContent.length > 0) {
          let heading: any = undefined;
          if (tag === 'h1') heading = HeadingLevel.HEADING_1;
          else if (tag === 'h2') heading = HeadingLevel.HEADING_2;
          else if (tag === 'h3') heading = HeadingLevel.HEADING_3;
          else if (tag === 'h4') heading = HeadingLevel.HEADING_4;
          const indent = extraIndent > 0 ? { left: extraIndent } : undefined;
          const runs = getRuns(elClone);
          if (runs.length > 0) {
            children.push(new Paragraph({
              children: runs,
              alignment,
              heading,
              indent,
              spacing: { before: 160, after: 160 },
            }));
          }
        }
        return;
      }

      // No images — pure text / heading paragraph
      let heading: any = undefined;
      if (tag === 'h1') heading = HeadingLevel.HEADING_1;
      else if (tag === 'h2') heading = HeadingLevel.HEADING_2;
      else if (tag === 'h3') heading = HeadingLevel.HEADING_3;
      else if (tag === 'h4') heading = HeadingLevel.HEADING_4;

      const indent = extraIndent > 0 ? { left: extraIndent } : undefined;
      const runs = getRuns(el);

      if (runs.length > 0 || heading !== undefined) {
        children.push(new Paragraph({
          children: runs.length ? runs : [new TextRun('')],
          alignment,
          heading,
          indent,
          spacing: { before: 160, after: 160 },
        }));
      }
    };

    for (const child of Array.from(dom.body.children)) {
      await processElement(child);
    }

    if (children.length === 0) {
      children.push(new Paragraph({ children: [new TextRun('Empty document')] }));
    }

    const doc = new Document({
      numbering: {
        config: [{
          reference: 'default-numbering',
          levels: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(level => ({
            level,
            format: 'decimal',
            text: `%${level + 1}.`,
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 720 * (level + 1), hanging: 360 } },
            },
          })),
        }],
      },
      sections: [{ properties: {}, children }],
    });

    const blob = await Packer.toBlob(doc);
    const fileName = window.prompt('Enter filename:', 'document') || 'document';
    downloadBlob(blob, `${fileName.replace(/\.docx$/, '')}.docx`);
  };

  /* ── Export HTML ──────────────────────────────────── */
  const handleExportHTML = () => {
    if (!editor) return;
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Document</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #111; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #ddd; padding: 8px; }
    th { background: #f0f0f0; font-weight: bold; color: #111; }
    img { display: block; max-width: 100%; height: auto; margin: 1em 0; }
    pre { background: #f3f4f6; padding: 1em; border-radius: 4px; overflow-x: auto; }
    code { font-family: 'Courier New', monospace; font-size: 0.9em; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1em; color: #555; }
    ul[data-type="taskList"] { list-style: none; padding: 0; }
    ul[data-type="taskList"] li { display: flex; align-items: center; gap: 8px; }
  </style>
</head>
<body>${editor.getHTML()}</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    downloadBlob(blob, 'document.html');
  };

  /* ── Print ────────────────────────────────────────── */
  const handlePrint = () => {
    if (!editor) return;
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Print</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.7; color: #111; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #ccc; padding: 8px; }
    th { background: #f0f0f0; color: #111; }
    img { display: block !important; max-width: 100% !important; height: auto !important; margin: 1em 0 !important; }
    pre { background: #f3f4f6; padding: 1em; font-family: monospace; }
    blockquote { border-left: 4px solid #ddd; padding-left: 1em; margin-left: 0; }
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
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  /* ── Clear ────────────────────────────────────────── */
  const handleClear = () => setShowClearConfirm(true);
  const confirmClear = () => { editor?.commands.clearContent(); setShowClearConfirm(false); };

  if (!editor) return null;

  const chars = editor.storage.characterCount.characters();
  const words = editor.storage.characterCount.words();

  const wrapperClass = isFullscreen
    ? 'fixed inset-0 z-[200] bg-[#0e0e0e] overflow-auto p-6 lg:p-12'
    : 'max-w-5xl mx-auto';

  return (
    <div ref={containerRef} className={wrapperClass} {...getRootProps()}>
      <input {...getInputProps()} />

      {/* ── Inline Clear Confirm ── */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center">
          <div className="bg-[#1a1a1a] border border-border-subtle p-6 rounded-md max-w-sm w-full mx-4 shadow-2xl">
            <p className="font-mono text-sm text-soft-white/80 mb-4">Clear all document content?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 font-mono text-[10px] uppercase tracking-wider border border-border-subtle text-soft-white/50 hover:text-soft-white transition-subtle">
                Cancel
              </button>
              <button onClick={confirmClear}
                className="px-4 py-2 font-mono text-[10px] uppercase tracking-wider bg-red-500/80 text-white hover:bg-red-500 transition-subtle">
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* ── Toolbar Row 1 ────────────────────────────────── */}
      <div className="sticky top-16 z-30 border border-border-subtle bg-[#0A0A0A]/95 backdrop-blur-md mb-1">
        <div className="flex flex-wrap items-center gap-0.5 p-1">
          <HeadingSelect editor={editor} />
          <FontFamilySelect editor={editor} />
          <TDivider />
          <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={Bold} title="Bold (Ctrl+B)" />
          <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={Italic} title="Italic (Ctrl+I)" />
          <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} icon={UnderlineIcon} title="Underline (Ctrl+U)" />
          <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} icon={Strikethrough} title="Strikethrough" />
          <TBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} icon={Code} title="Inline Code" />
          <TBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} icon={SubIcon} title="Subscript" />
          <TBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} icon={SupIcon} title="Superscript" />
          <TDivider />
          <HighlightPicker editor={editor} />
          {/* FIX: TextColorPicker is now properly placed and wired */}
          <TextColorPicker editor={editor} />
          <TDivider />
          <LinkButton editor={editor} />
          <ImageButton editor={editor} />
          <TableControls editor={editor} />
        </div>

        {/* ── Toolbar Row 2 ───────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-0.5 p-1 border-t border-border-subtle/50">
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
          <TBtn onClick={() => editor.chain().focus().undo().run()} icon={RotateCcw} title="Undo (Ctrl+Z)" disabled={!editor.can().undo()} />
          <TBtn onClick={() => editor.chain().focus().redo().run()} icon={RotateCw} title="Redo (Ctrl+Y)" disabled={!editor.can().redo()} />
          <TDivider />
          <TBtn onClick={() => setShowSearch(s => !s)} active={showSearch} icon={Search} title="Search & Replace (Ctrl+F)" />
          <TBtn onClick={handleClear} icon={Pilcrow} title="Clear Content" />

          <div className="ml-auto flex items-center gap-3">
            <span className="font-mono text-[9px] text-soft-white/30 uppercase tracking-wider">
              {words} words · {chars} chars
            </span>
            <TBtn onClick={() => setIsFullscreen(f => !f)} icon={isFullscreen ? Minimize : Maximize} title="Toggle Fullscreen (Esc to exit)" />
          </div>
        </div>
      </div>

      {/* ── Search & Replace ─────────────────────────────── */}
      <SearchReplacePanel editor={editor} open={showSearch} onClose={() => setShowSearch(false)} />

      {/* ── Drag overlay ─────────────────────────────────── */}
      {isDragActive && (
        <div className="absolute inset-0 z-20 bg-accent/5 border-2 border-dashed border-accent/40 flex items-center justify-center pointer-events-none">
          <span className="font-mono text-sm text-accent uppercase tracking-widest">Drop .docx file here</span>
        </div>
      )}

      {/* ── Editor Workspace ─────────────────────────────── */}
      <div className="bg-gray-100 p-8 min-h-screen overflow-auto">
        {/*
          FIX: table-header-cell class overrides the dark theme's white text
          so th content is readable in the light document area.
          Also fixes th background to light grey so it's visually distinct.
        */}
        <style>{`
          .ProseMirror table th,
          .ProseMirror .table-header-cell {
            background-color: #f0f0f0 !important;
            color: #111111 !important;
            font-weight: 600;
          }
          .ProseMirror table td,
          .ProseMirror table th {
            border: 1px solid #d1d5db;
            padding: 6px 10px;
            min-width: 60px;
            vertical-align: top;
          }
          .ProseMirror table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
          }
          .ProseMirror table p {
            margin: 0;
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept=".docx"
        onChange={e => { const file = e.target.files?.[0]; if (file) onDrop([file]); }} />
    </div>
  );
}