"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Trash2, Layout, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFDocument } from 'pdf-lib';
import { motion, Reorder, AnimatePresence } from 'motion/react';

interface PDFPageItem {
  id: string;
  index: number;
  thumbnail: string;
}

const PDFReorder = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PDFPageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setIsProcessing(true);
      
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const pageItems: PDFPageItem[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.3 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            await page.render({ canvasContext: context, viewport, canvas: canvas } as any).promise;
            pageItems.push({
              id: `page-${i}`,
              index: i - 1,
              thumbnail: canvas.toDataURL(),
            });
          }
        }
        setPages(pageItems);
        setIsReady(true);
      } catch (error) {
        console.error('Error loading PDF:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const saveReorderedPDF = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdfDoc = await PDFDocument.create();
      
      const pageIndices = pages.map(p => p.index);
      const copiedPages = await newPdfDoc.copyPages(pdfDoc, pageIndices);
      
      copiedPages.forEach(page => newPdfDoc.addPage(page));
      
      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes] as any, { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `reordered-${file.name}`;
      link.click();
    } catch (error) {
      console.error('Error saving PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const removePage = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
  };

  const clear = () => {
    setFile(null);
    setPages([]);
    setIsReady(false);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8 border-b border-border-subtle pb-8">
        <div>
          <h2 className="text-4xl font-heading font-bold tracking-tight mb-2">PDF Reorder</h2>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase text-accent font-bold tracking-[0.2em]">
              [ Pro Document Engine ]
            </span>
            <div className="w-1 h-1 rounded-full bg-soft-white/20" />
            <p className="font-mono text-[10px] uppercase text-soft-white/40 tracking-widest">
              Visual reordering • Page extraction
            </p>
          </div>
        </div>
        {isReady && (
          <button 
            onClick={saveReorderedPDF}
            disabled={isProcessing}
            className="h-12 px-8 bg-accent text-primary-bg font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-accent/80 transition-subtle flex items-center gap-2 disabled:opacity-30"
          >
            <Download size={14} /> Export Reordered PDF
          </button>
        )}
      </div>

      {!isReady ? (
        <div 
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`relative aspect-[21/9] border-2 border-dashed border-border-subtle flex flex-col items-center justify-center transition-subtle cursor-pointer hover:border-accent/40 hover:bg-accent/5 ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
        >
          <div className="text-center space-y-4">
            <div className="p-6 bg-white/[0.02] border border-border-subtle inline-block text-soft-white/20">
              <Layout size={40} strokeWidth={1} />
            </div>
            <p className="font-mono text-[12px] uppercase tracking-widest text-soft-white/20">
              {isProcessing ? 'Generating Thumbnails...' : 'Select PDF to reorder pages'}
            </p>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
        </div>
      ) : (
        <div className="space-y-12">
          <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-border-subtle">
            <div className="flex items-center gap-6">
              <FileText size={20} className="text-accent" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase text-soft-white/40 tracking-widest mb-1">Editing Document</span>
                <span className="text-soft-white font-medium">{file?.name}</span>
              </div>
            </div>
            <Button variant="ghost" onClick={clear} className="text-[10px] font-mono uppercase tracking-widest text-soft-white/20 hover:text-red-400 hover:bg-red-500/5">
              Reset
            </Button>
          </div>

          <Reorder.Group 
            axis="x" 
            values={pages} 
            onReorder={setPages}
            className="flex gap-6 overflow-x-auto pb-8 snap-x custom-scrollbar"
          >
            <AnimatePresence>
              {pages.map((page) => (
                <Reorder.Item 
                  key={page.id} 
                  value={page}
                  className="group relative w-48 shrink-0 aspect-[3/4] cursor-grab active:cursor-grabbing border border-border-subtle hover:border-accent transition-subtle bg-white/[0.01] snap-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <img src={page.thumbnail} alt={`Page ${page.index + 1}`} className="w-full h-full object-cover p-2" />
                  
                  <div className="absolute inset-0 bg-[#161616]/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold">Page {page.index + 1}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removePage(page.id); }}
                      className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-subtle border border-red-500/20"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="absolute top-2 left-2 px-2 py-1 bg-accent/90 text-primary-bg font-mono text-[8px] font-bold">
                    #{pages.indexOf(page) + 1}
                  </div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>

          <div className="flex items-center gap-4 p-8 border border-border-subtle bg-accent/5">
            <Sliders size={18} className="text-accent" />
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-accent/60">
              Drag and drop pages to reorder. Use the trash icon to remove unwanted pages.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFReorder;
