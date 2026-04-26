"use client";
import React, { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Download, FileText } from 'lucide-react';
import { downloadBlob } from '../lib/utils';

export default function MarkdownEditor() {
  const [value, setValue] = useState<string | undefined>("# New Markdown File\n\nStart writing here...");

  const handleDownload = () => {
    if (!value) return;
    downloadBlob(new Blob([value], { type: 'text/markdown' }), 'document.md');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8 border-b border-border-subtle pb-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter">Markdown Editor</h2>
          <p className="font-mono text-[10px] uppercase text-soft-white/40 mt-1">Live preview • Local processing</p>
        </div>
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 border-subtle text-xs font-mono uppercase bg-accent text-primary-bg font-bold hover:bg-accent/80 transition-subtle"
        >
          <Download size={14} /> Export .md
        </button>
      </div>

      <div data-color-mode="dark" className="border-subtle overflow-hidden">
        <MDEditor
          value={value}
          onChange={setValue}
          height={600}
          preview="live"
          className="!bg-transparent"
        />
      </div>

      <div className="mt-8 flex items-center gap-4 p-4 border-subtle bg-white/[0.02]">
        <FileText size={16} className="text-accent" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-soft-white/40">Markdown is standard GFM. All rendering happens in your browser.</span>
      </div>
    </div>
  );
}
