"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Download, ImageIcon, Trash2, Maximize, CheckCircle2, Link as LinkIcon, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { motion } from 'motion/react';

const ImageResizer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resized, setResized] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState(1);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
    setResized(null);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height });
      setDimensions({ width: img.width, height: img.height });
      setAspectRatio(img.width / img.height);
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      processFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      processFile(droppedFile);
    }
  };

  const handleWidthChange = (val: number) => {
    if (lockAspectRatio) {
      setDimensions({ width: val, height: Math.round(val / aspectRatio) });
    } else {
      setDimensions(prev => ({ ...prev, width: val }));
    }
  };

  const handleHeightChange = (val: number) => {
    if (lockAspectRatio) {
      setDimensions({ width: Math.round(val * aspectRatio), height: val });
    } else {
      setDimensions(prev => ({ ...prev, height: val }));
    }
  };

  const resizeImage = () => {
    if (!file || !preview) return;
    setIsProcessing(true);

    const img = new Image();
    img.src = preview;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const ctx = canvas.getContext('2d');
      
      // Use high quality interpolation
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
        
        const dataUrl = canvas.toDataURL(file.type);
        setResized(dataUrl);
        setIsProcessing(false);
      }
    };
  };

  const downloadImage = () => {
    if (!resized) return;
    const link = document.createElement('a');
    link.href = resized;
    link.download = `resized-${file?.name}`;
    link.click();
  };

  const clear = () => {
    setFile(null);
    setPreview(null);
    setResized(null);
    setDimensions({ width: 0, height: 0 });
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8 border-b border-border-subtle pb-8">
        <div>
          <h2 className="text-4xl font-heading font-bold tracking-tight mb-2">Image Resizer</h2>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase text-accent font-bold tracking-[0.2em]">
              [ Pro Utility ]
            </span>
            <div className="w-1 h-1 rounded-full bg-soft-white/20" />
            <p className="font-mono text-[10px] uppercase text-soft-white/40 tracking-widest">
              Pixel perfect • Local scaling
            </p>
          </div>
        </div>
        {resized && (
          <button 
            onClick={downloadImage}
            className="h-12 px-8 bg-accent text-primary-bg font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-accent/80 transition-subtle flex items-center gap-2"
          >
            <Download size={14} /> Download Resized
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <Label className="font-mono text-[10px] uppercase tracking-widest text-soft-white/40">Preview</Label>
          <div 
            onClick={() => !file && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative aspect-square border flex flex-col items-center justify-center transition-subtle cursor-pointer overflow-hidden bg-white/[0.01] ${isDragging ? 'border-accent bg-accent/10' : file ? 'border-border-subtle' : 'border-border-subtle hover:border-accent/40 hover:bg-accent/5'}`}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-contain p-8" />
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 bg-white/[0.02] border border-border-subtle inline-block text-soft-white/20">
                  <ImageIcon size={32} strokeWidth={1} />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-soft-white/20">Drop image to resize</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
          
          {file && (
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-border-subtle">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase text-soft-white/40 tracking-widest mb-1">Original Size</span>
                <span className="text-soft-white font-medium text-xs font-mono">{originalDimensions.width} × {originalDimensions.height} px</span>
              </div>
              <Button variant="ghost" size="icon" onClick={clear} className="text-soft-white/20 hover:text-red-500">
                <Trash2 size={16} />
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="p-8 border border-border-subtle bg-white/[0.02] space-y-12">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Maximize size={14} className="text-accent" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-soft-white/60">Target Dimensions</span>
              </div>

              <div className="grid grid-cols-2 gap-8 items-end relative">
                <div className="space-y-3">
                  <Label className="font-mono text-[8px] uppercase tracking-[0.2em] text-soft-white/40">Width</Label>
                  <input 
                    type="number" 
                    value={dimensions.width}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="w-full bg-transparent border-b border-border-subtle py-2 font-mono text-xl focus:outline-none focus:border-accent text-soft-white"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="font-mono text-[8px] uppercase tracking-[0.2em] text-soft-white/40">Height</Label>
                  <input 
                    type="number" 
                    value={dimensions.height}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="w-full bg-transparent border-b border-border-subtle py-2 font-mono text-xl focus:outline-none focus:border-accent text-soft-white"
                  />
                </div>
                <button 
                  onClick={() => setLockAspectRatio(!lockAspectRatio)}
                  className={`absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 p-2 border border-border-subtle bg-[#161616] transition-subtle ${lockAspectRatio ? 'text-accent' : 'text-soft-white/20'}`}
                  title={lockAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
                >
                  {lockAspectRatio ? <LinkIcon size={14} /> : <Unlink size={14} />}
                </button>
              </div>

              <div className="flex gap-4">
                {[0.25, 0.5, 0.75, 2].map((scale) => (
                  <button
                    key={scale}
                    onClick={() => handleWidthChange(Math.round(originalDimensions.width * scale))}
                    className="flex-1 py-2 border border-border-subtle font-mono text-[8px] uppercase text-soft-white/40 hover:text-accent hover:border-accent/40 transition-subtle"
                  >
                    {scale * 100}%
                  </button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full h-14 bg-accent text-primary-bg hover:bg-accent/90 rounded-none font-mono text-[11px] uppercase tracking-[0.2em] transition-subtle disabled:opacity-30"
              disabled={!file || isProcessing}
              onClick={resizeImage}
            >
              {isProcessing ? 'Resizing...' : '[ Apply Resize ]'}
            </Button>
          </div>

          {resized && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 border border-accent/20 bg-accent/5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 text-accent">
                <CheckCircle2 size={16} />
                <span className="font-mono text-[10px] uppercase tracking-widest">Image scaled successfully</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-[10px] uppercase text-accent/60 tracking-widest block mb-1">New Dimensions</span>
                <span className="text-lg font-bold text-accent font-mono">{dimensions.width} × {dimensions.height}</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageResizer;
