"use client";

import React, { useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Download, 
  Upload, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Minus, 
  Code, 
  Strikethrough,
  RotateCcw,
  RotateCw,
  AlignLeft
} from 'lucide-react';
import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { downloadBlob } from '../lib/utils';
import { useDropzone } from 'react-dropzone';

export default function WordEditor() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Start typing or drop a .docx file here...</p>',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[600px] p-12 focus:outline-none focus:ring-1 focus:ring-accent/20 border border-border-subtle bg-white/[0.01] font-sans selection:bg-accent/30',
      },
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      editor?.commands.setContent(result.value);
    }
  }, [editor]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  const handleExport = async () => {
    if (!editor) return;
    const json = editor.getJSON();
    const children: Paragraph[] = [];

    json.content?.forEach(node => {
      if (node.type === 'paragraph' || node.type === 'heading') {
        const runs: TextRun[] = [];
        node.content?.forEach(textNode => {
          if (textNode.type === 'text') {
            const node = textNode as any;
            runs.push(new TextRun({
              text: node.text || '',
              bold: node.marks?.some((m: any) => m.type === 'bold'),
              italics: node.marks?.some((m: any) => m.type === 'italic'),
            }));
          }
        });
        children.push(new Paragraph({ children: runs }));
      }
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: children.length > 0 ? children : [new Paragraph({ children: [new TextRun('Empty document')] })],
      }],
    });

    const blob = await Packer.toBlob(doc);
    downloadBlob(blob, 'document.docx');
  };

  if (!editor) return null;

  return (
    <div className="max-w-5xl mx-auto" {...getRootProps()}>
      <input {...getInputProps()} />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8 border-b border-border-subtle pb-8">
        <div>
          <h2 className="text-4xl font-heading font-bold tracking-tight mb-2">Word Editor</h2>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase text-accent font-bold tracking-[0.2em]">
              {isDragActive ? '[ Ready to import ]' : '[ Offline Build ]'}
            </span>
            <div className="w-1 h-1 rounded-full bg-soft-white/20" />
            <p className="font-mono text-[10px] uppercase text-soft-white/40 tracking-widest">
              DOCX compatible • Local processing
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="h-12 px-6 border border-border-subtle font-mono text-[10px] uppercase tracking-widest text-soft-white/60 hover:text-accent hover:border-accent/40 transition-subtle flex items-center gap-2"
          >
            <Upload size={14} /> Import
          </button>
          <button 
            onClick={handleExport}
            className="h-12 px-6 bg-accent text-primary-bg font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-accent/80 transition-subtle flex items-center gap-2"
          >
            <Download size={14} /> Export .docx
          </button>
        </div>
      </div>

      <div className="sticky top-16 z-30 flex flex-wrap gap-1 p-1 border border-border-subtle bg-[#0A0A0A]/95 backdrop-blur-md mb-8">
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          active={editor.isActive('bold')} 
          icon={Bold} 
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          active={editor.isActive('italic')} 
          icon={Italic} 
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleStrike().run()} 
          active={editor.isActive('strike')} 
          icon={Strikethrough} 
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleCode().run()} 
          active={editor.isActive('code')} 
          icon={Code} 
        />
        
        <div className="w-px h-6 bg-border-subtle mx-2 self-center" />
        
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          active={editor.isActive('bulletList')} 
          icon={List} 
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          active={editor.isActive('orderedList')} 
          icon={ListOrdered} 
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          active={editor.isActive('blockquote')} 
          icon={Quote} 
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().setHorizontalRule().run()} 
          icon={Minus} 
        />

        <div className="w-px h-6 bg-border-subtle mx-2 self-center" />

        <ToolbarButton 
          onClick={() => editor.chain().focus().undo().run()} 
          icon={RotateCcw} 
        />
        <ToolbarButton 
          onClick={() => editor.chain().focus().redo().run()} 
          icon={RotateCw} 
        />

        <div className="ml-auto flex gap-1">
          <button 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-3 py-1 font-mono text-[10px] uppercase transition-subtle ${editor.isActive('heading', { level: 1 }) ? 'text-accent bg-accent/10' : 'text-soft-white/40 hover:text-soft-white'}`}
          >
            H1
          </button>
          <button 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-1 font-mono text-[10px] uppercase transition-subtle ${editor.isActive('heading', { level: 2 }) ? 'text-accent bg-accent/10' : 'text-soft-white/40 hover:text-soft-white'}`}
          >
            H2
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".docx" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onDrop([file]);
        }} 
      />
    </div>
  );
}

const ToolbarButton = ({ onClick, active, icon: Icon }: { onClick: () => void, active?: boolean, icon: any }) => (
  <button 
    onClick={onClick}
    className={`p-3 transition-subtle hover:bg-white/[0.05] ${active ? 'text-accent bg-accent/10' : 'text-soft-white/40'}`}
  >
    <Icon size={16} />
  </button>
);
