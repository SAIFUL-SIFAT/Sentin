"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Braces, Copy, Trash2, CheckCircle2, AlertCircle, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { json } from '@codemirror/lang-json';

const JSONFormatter = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: input,
      extensions: [
        basicSetup,
        json(),
        EditorView.theme({
          '&': { height: '500px', backgroundColor: 'transparent' },
          '.cm-content': { fontFamily: 'IBM Plex Mono, monospace', fontSize: '13px' },
          '.cm-gutters': { backgroundColor: 'transparent', border: 'none', color: '#444' },
          '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.02)' },
          '.cm-activeLineGutter': { backgroundColor: 'rgba(255,255,255,0.02)', color: '#4ADE80' },
        }, { dark: true }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setInput(update.state.doc.toString());
          }
        })
      ]
    });

    const view = new EditorView({
      state,
      parent: editorRef.current
    });

    viewRef.current = view;

    return () => view.destroy();
  }, []);

  const formatJSON = (pretty: boolean = true) => {
    const currentVal = viewRef.current?.state.doc.toString() || '';
    if (!currentVal.trim()) return;
    try {
      const parsed = JSON.parse(currentVal);
      const formatted = pretty 
        ? JSON.stringify(parsed, null, 2) 
        : JSON.stringify(parsed);
      
      viewRef.current?.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: formatted }
      });
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const copyToClipboard = () => {
    const currentVal = viewRef.current?.state.doc.toString() || '';
    if (!currentVal) return;
    navigator.clipboard.writeText(currentVal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => {
    viewRef.current?.dispatch({
      changes: { from: 0, to: viewRef.current.state.doc.length, insert: '' }
    });
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-12">
        <h2 className="text-3xl font-heading font-bold mb-4">JSON Formatter</h2>
        <p className="text-soft-white/40 font-sans">
          Format, minify, and validate JSON data locally. 
          The editor includes syntax highlighting and instant validation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-accent/5 blur opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
          <div className="relative border border-border-subtle bg-[#050505]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <FileJson size={16} className="text-accent" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-soft-white/60">Input / Output</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatJSON(true)}
                  className="font-mono text-[9px] uppercase tracking-widest hover:text-accent"
                >
                  [ Pretty ]
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => formatJSON(false)}
                  className="font-mono text-[9px] uppercase tracking-widest hover:text-accent"
                >
                  [ Minify ]
                </Button>
                <div className="w-px h-4 bg-border-subtle/50 mx-2" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={copyToClipboard}
                  className={copied ? 'text-accent' : 'text-soft-white/20 hover:text-accent'}
                >
                  <Copy size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={clear}
                  className="text-soft-white/20 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
            
            <div ref={editorRef} className="p-2" />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 border border-red-500/30 bg-red-500/5 text-red-500">
            <AlertCircle size={16} />
            <span className="font-mono text-[11px] uppercase tracking-widest">Invalid JSON: {error}</span>
          </div>
        )}

        {!error && input && (
          <div className="flex items-center gap-3 p-4 border border-accent/30 bg-accent/5 text-accent">
            <CheckCircle2 size={16} />
            <span className="font-mono text-[11px] uppercase tracking-widest">Valid JSON Structure</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default JSONFormatter;
