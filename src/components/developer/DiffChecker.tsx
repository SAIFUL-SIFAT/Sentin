"use client";
import React, { useState, useEffect } from 'react';
import { GitCompare, ArrowRight, Trash2, Copy, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const DiffChecker = () => {
  const [original, setOriginal] = useState('');
  const [modified, setModified] = useState('');
  const [diff, setDiff] = useState<Array<{ type: 'unchanged' | 'added' | 'removed', value: string }>>([]);

  const computeDiff = () => {
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');
    const result: Array<{ type: 'unchanged' | 'added' | 'removed', value: string }> = [];

    let i = 0, j = 0;
    while (i < originalLines.length || j < modifiedLines.length) {
      if (i < originalLines.length && j < modifiedLines.length && originalLines[i] === modifiedLines[j]) {
        result.push({ type: 'unchanged', value: originalLines[i] });
        i++;
        j++;
      } else if (j < modifiedLines.length && (i >= originalLines.length || !originalLines.slice(i).includes(modifiedLines[j]))) {
        result.push({ type: 'added', value: modifiedLines[j] });
        j++;
      } else if (i < originalLines.length) {
        result.push({ type: 'removed', value: originalLines[i] });
        i++;
      }
    }
    setDiff(result);
  };

  useEffect(() => {
    computeDiff();
  }, [original, modified]);

  const clear = () => {
    setOriginal('');
    setModified('');
  };

  return (
    <div className="max-w-7xl mx-auto pb-32">
      <div className="mb-12">
        <h2 className="text-3xl font-heading font-bold mb-4">Diff Checker</h2>
        <p className="text-soft-white/40 font-sans max-w-2xl">
          Compare two versions of text or code to see additions and deletions. 
          The comparison is performed line-by-line locally in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-soft-white/40">Original Version</Label>
            <span className="font-mono text-[9px] text-red-500/60 uppercase tracking-widest">[ DELETIONS ]</span>
          </div>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            className="w-full h-80 bg-white/[0.01] border border-border-subtle p-6 font-mono text-[13px] text-soft-white/80 placeholder:text-soft-white/10 focus:border-red-500/20 focus:bg-red-500/[0.01] transition-subtle outline-none resize-none"
            placeholder="Paste original text here..."
          />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <Label className="font-mono text-[10px] uppercase tracking-widest text-soft-white/40">Modified Version</Label>
            <span className="font-mono text-[9px] text-accent/60 uppercase tracking-widest">[ ADDITIONS ]</span>
          </div>
          <textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            className="w-full h-80 bg-white/[0.01] border border-border-subtle p-6 font-mono text-[13px] text-soft-white/80 placeholder:text-soft-white/10 focus:border-accent/20 focus:bg-accent/[0.01] transition-subtle outline-none resize-none"
            placeholder="Paste modified text here..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-8">
          <div className="flex items-center gap-3">
            <GitCompare size={16} className="text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-soft-white/60">Diff Output</span>
          </div>
          <Button variant="ghost" size="sm" onClick={clear} className="font-mono text-[9px] uppercase tracking-widest text-soft-white/20 hover:text-red-500">
            [ Clear All ]
          </Button>
        </div>

        <div className="border border-border-subtle bg-[#050505] min-h-[200px] font-mono text-[13px]">
          {diff.length === 0 ? (
            <div className="p-12 text-center text-soft-white/10 italic">Enter text above to see differences</div>
          ) : (
            <div className="divide-y divide-white/[0.02]">
              {diff.map((line, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-6 px-6 py-2 ${
                    line.type === 'added' ? 'bg-accent/5 text-accent' : 
                    line.type === 'removed' ? 'bg-red-500/5 text-red-500/80' : 
                    'text-soft-white/40'
                  }`}
                >
                  <span className="w-8 shrink-0 text-right opacity-20 select-none">{idx + 1}</span>
                  <span className="w-4 shrink-0 select-none">
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                  </span>
                  <span className="whitespace-pre-wrap break-all">{line.value || ' '}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiffChecker;
