"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Eye, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

export default function PDFViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles[0]) setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  useEffect(() => {
    if (!file) return;

    const loadPdf = async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;
        
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setPageNumber(1);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPdf();
  }, [file]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      const page = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current!;
      const context = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      await page.render(renderContext).promise;
    };

    renderPage();
  }, [pdfDoc, pageNumber, scale]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-12 border-b border-border-subtle pb-6 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter">PDF Viewer</h2>
          <p className="text-soft-white/60 mt-2 font-mono text-[10px] uppercase tracking-widest">Zero-upload secure viewing</p>
        </div>
        {file && (
          <div className="flex items-center gap-4 bg-white/[0.03] p-2 border-subtle">
            <div className="flex items-center gap-1 font-mono text-xs">
              <button 
                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                className="p-1 hover:text-accent disabled:opacity-20"
                disabled={pageNumber <= 1}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 text-soft-white/80">{pageNumber} <span className="text-soft-white/20">/</span> {numPages}</span>
              <button 
                onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
                className="p-1 hover:text-accent disabled:opacity-20"
                disabled={pageNumber >= numPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="w-px h-4 bg-border-subtle" />
            <div className="flex items-center gap-1">
              <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1 hover:text-accent text-soft-white/40"><ZoomOut size={16} /></button>
              <span className="text-[10px] font-mono text-soft-white/40">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="p-1 hover:text-accent text-soft-white/40"><ZoomIn size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {!file ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed border-border-subtle py-48 flex flex-col items-center justify-center bg-white/[0.01] hover:bg-white/[0.03] transition-subtle cursor-pointer group rounded-sm ${isDragActive ? 'border-accent bg-accent/5' : ''}`}
        >
          <input {...getInputProps()} />
          <Eye size={48} className="mb-6 text-soft-white/10 group-hover:text-accent/60 transition-subtle" />
          <p className="font-mono text-sm uppercase tracking-[0.3em] text-soft-white/30 group-hover:text-soft-white/80 transition-subtle">Drop PDF to view</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-8 min-h-[800px]">
          <div className="p-1 border-subtle bg-white shadow-2xl relative">
             <canvas ref={canvasRef} className="max-w-full h-auto" />
             <div className="absolute top-0 right-0 p-4 opacity-0 hover:opacity-100 transition-opacity">
               <button className="p-2 bg-primary-bg/80 text-soft-white rounded-md backdrop-blur-sm">
                 <Maximize size={16} />
               </button>
             </div>
          </div>
          
          <button 
            onClick={() => setFile(null)}
            className="text-[10px] font-mono uppercase text-soft-white/30 hover:text-accent transition-subtle flex items-center gap-2 mb-20"
          >
            [ Close viewer ]
          </button>
        </div>
      )}
    </div>
  );
}
