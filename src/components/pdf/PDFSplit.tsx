"use client";
import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useDropzone } from 'react-dropzone';
import { Scissors, Download, Info, Plus, X } from 'lucide-react';
import { downloadBlob } from '@/lib/utils';

export default function PDFSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [splits, setSplits] = useState<{ start: string; end: string }[]>([{ start: '1', end: '' }]);
  const [isSplitting, setIsSplitting] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles[0]) setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  const addSplitRange = () => setSplits([...splits, { start: '', end: '' }]);
  const removeSplitRange = (index: number) => setSplits(splits.filter((_, i) => i !== index));

  const updateSplit = (index: number, field: 'start' | 'end', value: string) => {
    const newSplits = [...splits];
    newSplits[index][field] = value;
    setSplits(newSplits);
  };

  const splitPdf = async () => {
    if (!file) return;
    setIsSplitting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const pageCount = sourcePdf.getPageCount();

      for (let i = 0; i < splits.length; i++) {
        const { start, end } = splits[i];
        const s = parseInt(start);
        const e = end ? parseInt(end) : s;

        if (isNaN(s) || s < 1 || s > pageCount) continue;
        const validE = isNaN(e) ? s : Math.min(Math.max(s, e), pageCount);

        const newPdf = await PDFDocument.create();
        const indices = Array.from({ length: validE - s + 1 }, (_, idx) => s - 1 + idx);
        const copiedPages = await newPdf.copyPages(sourcePdf, indices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        const pdfBytes = await newPdf.save();
        downloadBlob(new Blob([pdfBytes] as BlobPart[], { type: 'application/pdf' }), `${file.name.replace('.pdf', '')}_split_${s}-${validE}.pdf`);
      }
    } catch (error) {
      console.error('Error splitting PDF:', error);
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12 border-b border-border-subtle pb-6">
        <h2 className="text-4xl font-bold tracking-tighter">PDF Split</h2>
        <p className="text-soft-white/60 mt-2 font-mono text-[10px] uppercase tracking-widest">Extract pages or split into segments</p>
      </div>

      {!file ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed border-border-subtle py-32 flex flex-col items-center justify-center bg-white/[0.01] hover:bg-white/[0.03] transition-subtle cursor-pointer group rounded-sm ${isDragActive ? 'border-accent bg-accent/5' : ''}`}
        >
          <input {...getInputProps()} />
          <Scissors size={40} className="mb-4 text-soft-white/10 group-hover:text-accent/60 transition-subtle" />
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-soft-white/40">Drop PDF to start</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between p-6 border-subtle bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="p-3 border-subtle bg-accent/5 text-accent">
                <Scissors size={20} />
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight">{file.name}</p>
                <p className="text-[10px] font-mono text-soft-white/30 uppercase">Local session • {(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <button 
              onClick={() => { setFile(null); setSplits([{ start: '1', end: '' }]); }}
              className="text-[10px] font-mono uppercase text-soft-white/20 hover:text-accent transition-subtle"
            >
              [ Change file ]
            </button>
          </div>

          <div className="space-y-4">
            <label className="font-mono text-[10px] uppercase text-soft-white/30 tracking-widest">Extraction Ranges</label>
            {splits.map((split, index) => (
              <div key={index} className="flex gap-4 items-center animate-in fade-in slide-in-from-left-2 duration-200">
                <input 
                  type="number" 
                  placeholder="Start Page"
                  value={split.start}
                  onChange={(e) => updateSplit(index, 'start', e.target.value)}
                  className="w-full bg-white/[0.02] border-subtle p-3 font-mono text-sm focus:border-accent/40 outline-none transition-subtle"
                />
                <span className="text-soft-white/20 font-mono text-xs italic">to</span>
                <input 
                  type="number" 
                  placeholder="End Page (optional)"
                  value={split.end}
                  onChange={(e) => updateSplit(index, 'end', e.target.value)}
                  className="w-full bg-white/[0.02] border-subtle p-3 font-mono text-sm focus:border-accent/40 outline-none transition-subtle"
                />
                {splits.length > 1 && (
                  <button onClick={() => removeSplitRange(index)} className="p-3 border-subtle text-soft-white/20 hover:text-red-400 hover:border-red-400/20 transition-subtle">
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
            <button 
              onClick={addSplitRange}
              className="w-full py-4 border-subtle border-dashed text-soft-white/30 font-mono text-[10px] uppercase hover:bg-white/[0.02] hover:text-accent transition-subtle flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Add another range
            </button>
          </div>

          <div className="pt-8 flex items-center justify-between border-t border-border-subtle">
            <div className="flex items-center gap-3 text-soft-white/30 text-[10px] font-mono uppercase">
              <Info size={14} className="text-accent/40" />
              <span>Each range creates a new PDF</span>
            </div>
            <button 
              onClick={splitPdf}
              disabled={isSplitting || !splits[0].start}
              className="px-12 py-4 bg-accent text-primary-bg font-bold text-xs uppercase tracking-widest hover:bg-accent/80 transition-subtle disabled:opacity-30"
            >
              {isSplitting ? 'Processing...' : 'Split & Download'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
