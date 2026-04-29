"use client";
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, Download, X, Plus, GripVertical } from 'lucide-react';
import { downloadBlob } from '@/lib/utils';
import { Reorder } from 'motion/react';

export default function ImageToPDF() {
  const [images, setImages] = useState<{ id: string; file: File; preview: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }
  });

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const generatePdf = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    try {
      const pdf = new jsPDF();
      
      for (let i = 0; i < images.length; i++) {
        const { file } = images[i];
        const imgData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        // Add page if not first
        if (i !== 0) pdf.addPage();
        
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = imgData;
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgRatio = img.width / img.height;
        const pageRatio = pageWidth / pageHeight;

        let w, h, x, y;
        if (imgRatio > pageRatio) {
          w = pageWidth - 20;
          h = w / imgRatio;
        } else {
          h = pageHeight - 20;
          w = h * imgRatio;
        }
        
        x = (pageWidth - w) / 2;
        y = (pageHeight - h) / 2;

        pdf.addImage(imgData, 'JPEG', x, y, w, h);
      }

      const pdfBlob = pdf.output('blob');
      downloadBlob(pdfBlob, 'converted_images.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12 border-b border-border-subtle pb-6">
        <h2 className="text-4xl font-bold tracking-tighter">Image to PDF</h2>
        <p className="text-soft-white/60 mt-2 font-mono text-[10px] uppercase tracking-widest">Convert images to high-quality documents</p>
      </div>

      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed border-border-subtle py-24 flex flex-col items-center justify-center bg-white/[0.01] hover:bg-white/[0.03] transition-subtle cursor-pointer group rounded-sm ${isDragActive ? 'border-accent bg-accent/5' : ''}`}
      >
        <input {...getInputProps()} />
        <ImageIcon size={40} className="mb-4 text-soft-white/10 group-hover:text-accent/60 transition-subtle" />
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-soft-white/40">Drop images (JPG, PNG, WebP)</p>
      </div>

      <div className="mt-12">
        <Reorder.Group axis="y" values={images} onReorder={setImages} className="space-y-4">
          {images.map((img) => (
            <Reorder.Item key={img.id} value={img}>
              <div className="flex items-center gap-6 p-4 border-subtle bg-white/[0.03] animate-in fade-in slide-in-from-bottom-2">
                <GripVertical size={16} className="text-soft-white/10 cursor-grab active:cursor-grabbing" />
                <div className="w-16 h-16 border-subtle bg-black overflow-hidden flex-shrink-0">
                  <img src={img.preview} alt="preview" className="w-full h-full object-cover opacity-80" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate tracking-tight">{img.file.name}</p>
                  <p className="text-[10px] font-mono text-soft-white/30 uppercase">{(img.file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button 
                  onClick={() => removeImage(img.id)}
                  className="p-2 text-soft-white/20 hover:text-red-400 transition-subtle"
                >
                  <X size={18} />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      {images.length > 0 && (
        <div className="mt-12 flex items-center justify-between p-8 border-subtle bg-accent/5 border-accent/20">
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-accent">{images.length} Images loaded</span>
            <span className="text-[10px] font-mono text-accent/60 uppercase">Reorder using handles if needed</span>
          </div>
          <button 
            onClick={generatePdf}
            disabled={isProcessing}
            className="flex items-center gap-2 px-8 py-3 bg-accent text-primary-bg font-bold text-xs uppercase tracking-widest hover:bg-accent/80 transition-subtle"
          >
            {isProcessing ? 'Generating...' : <><Download size={16} /> Create PDF</>}
          </button>
        </div>
      )}
    </div>
  );
}
