"use client";
import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useDropzone } from 'react-dropzone';
import { Files, Download, Trash2, GripVertical, Plus } from 'lucide-react';
import { downloadBlob } from '@/lib/utils';
import { motion, Reorder } from 'motion/react';

export default function PDFMerge() {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] }
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const mergeFiles = async () => {
    if (files.length < 2) return;
    setIsMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      downloadBlob(new Blob([pdfBytes] as BlobPart[], { type: 'application/pdf' }), 'merged.pdf');
    } catch (error) {
      console.error('Error merging PDFs:', error);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12 border-b border-border-subtle pb-6">
        <h2 className="text-4xl font-bold tracking-tighter">PDF Merge</h2>
        <p className="text-soft-white/60 mt-2 font-mono text-[10px] uppercase tracking-widest">Combine multiple documents locally</p>
      </div>

      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed border-border-subtle py-20 px-8 flex flex-col items-center justify-center bg-white/[0.01] hover:bg-white/[0.03] transition-subtle cursor-pointer group rounded-sm ${isDragActive ? 'border-accent bg-accent/5' : ''}`}
      >
        <input {...getInputProps()} />
        <Plus size={40} className={`mb-4 transition-subtle ${isDragActive ? 'text-accent scale-110' : 'text-soft-white/10 group-hover:text-accent/60'}`} />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-soft-white/40 group-hover:text-soft-white/80">
          {isDragActive ? 'Drop to add' : 'Drop PDFs to merge or click to browse'}
        </p>
      </div>

      <div className="mt-12 space-y-2">
        <Reorder.Group axis="y" values={files} onReorder={setFiles}>
          {files.map((file, index) => (
            <Reorder.Item key={`${file.name}-${index}`} value={file}>
              <div className="flex items-center gap-4 p-4 border-subtle bg-white/[0.02] group">
                <GripVertical size={16} className="text-soft-white/10 cursor-grab active:cursor-grabbing" />
                <Files size={16} className="text-accent/60" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate tracking-tight">{file.name}</p>
                  <p className="text-[10px] font-mono text-soft-white/30 uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={() => removeFile(index)}
                  className="p-2 text-soft-white/20 hover:text-red-400 transition-subtle"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      {files.length > 0 && (
        <div className="mt-12 flex items-center justify-between p-8 border-subtle bg-accent/5 border-accent/20">
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-accent">{files.length} Files selected</span>
            <span className="text-[10px] font-mono text-accent/60 uppercase">Ready to merge</span>
          </div>
          <button 
            onClick={mergeFiles}
            disabled={files.length < 2 || isMerging}
            className="flex items-center gap-2 px-8 py-3 bg-accent text-primary-bg font-bold text-xs uppercase tracking-widest hover:bg-accent/80 disabled:opacity-30 disabled:cursor-not-allowed transition-subtle"
          >
            {isMerging ? 'Merging...' : <><Download size={16} /> Merge & Download</>}
          </button>
        </div>
      )}
    </div>
  );
}
