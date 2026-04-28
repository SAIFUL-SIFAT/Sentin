"use client";
import React, { useState, useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { markdown } from '@codemirror/lang-markdown';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { Download, FileCode, Search, Terminal } from 'lucide-react';
import { downloadBlob } from '@/lib/utils';

const languages: Record<string, any> = {
  javascript,
  typescript: () => javascript({ typescript: true }),
  python,
  markdown,
  html,
  css,
  json,
};

export default function CodeEditor() {
  const [lang, setLang] = useState('javascript');
  const [fileName, setFileName] = useState('script.js');
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: '// Write code here...\n',
      extensions: [
        basicSetup,
        languages[lang] ? languages[lang]() : javascript(),
        EditorView.theme({
          '&': { height: '600px', backgroundColor: 'transparent' },
          '.cm-content': { fontFamily: 'IBM Plex Mono, monospace', fontSize: '13px' },
          '.cm-gutters': { backgroundColor: 'transparent', border: 'none', color: '#444' },
          '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.02)' },
          '.cm-activeLineGutter': { backgroundColor: 'rgba(255,255,255,0.02)', color: '#4ADE80' },
        }, { dark: true }),
      ]
    });

    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => view.destroy();
  }, [lang]);

  const handleDownload = () => {
    if (!viewRef.current) return;
    const content = viewRef.current.state.doc.toString();
    downloadBlob(new Blob([content], { type: 'text/plain' }), fileName);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 md:py-12 pb-32 md:pb-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-border-subtle pb-6 gap-4">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter">Code Editor</h2>
          <p className="text-soft-white/60 mt-2 font-mono text-[10px] uppercase tracking-widest">Environment: Local Browser Runtime</p>
        </div>
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-primary-bg font-bold text-xs uppercase tracking-widest hover:bg-accent/80 transition-subtle"
        >
          <Download size={14} /> Export File
        </button>
      </div>

      <div className="flex flex-col border-subtle bg-white/[0.01]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-3 border-b border-border-subtle bg-white/[0.02] gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 border-subtle bg-white/[0.02]">
              <Terminal size={14} className="text-accent/60" />
              <input 
                type="text" 
                value={fileName} 
                onChange={(e) => setFileName(e.target.value)}
                className="bg-transparent font-mono text-[11px] uppercase tracking-wider outline-none w-40"
              />
            </div>
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent border-subtle px-3 py-1 font-mono text-[11px] uppercase tracking-wider outline-none text-soft-white/60 hover:text-accent transition-subtle cursor-pointer"
            >
              {Object.keys(languages).map(l => (
                <option key={l} value={l} className="bg-primary-bg">{l}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-mono text-soft-white/20 uppercase tracking-widest">
            <span className="flex items-center gap-2"><Search size={12} /> Search: ⌘F</span>
            <span>UTF-8</span>
          </div>
        </div>
        
        <div ref={editorRef} className="p-2" />
        
        <div className="px-6 py-3 border-t border-border-subtle bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between font-mono text-[10px] text-soft-white/20 uppercase gap-2">
          <div className="flex gap-4">
            <span>Syntax Highlighting: Active</span>
            <span>Autocompletion: Basic</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-accent/60">Live session</span>
          </div>
        </div>
      </div>
    </div>
  );
}
