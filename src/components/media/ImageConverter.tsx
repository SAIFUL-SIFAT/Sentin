"use client";
import React, { useState, useRef } from 'react';
import { Download, ImageIcon, Trash2, RefreshCcw, CheckCircle2, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { motion } from 'motion/react';

const formats = [
  { id: 'image/jpeg', label: 'JPEG', ext: 'jpg' },
  { id: 'image/png', label: 'PNG', ext: 'png' },
  { id: 'image/webp', label: 'WebP', ext: 'webp' },
];

const ImageConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [converted, setConverted] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState(formats[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setConverted(null);
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

  const convertImage = () => {
    if (!file || !preview) return;
    setIsProcessing(true);

    const img = new Image();
    img.src = preview;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL(targetFormat.id, 0.9);
        setConverted(dataUrl);
        setIsProcessing(false);
      }
    };
  };

  const downloadImage = () => {
    if (!converted) return;
    const link = document.createElement('a');
    link.href = converted;
    link.download = `converted-${file?.name.split('.')[0]}.${targetFormat.ext}`;
    link.click();
  };

  const clear = () => {
    setFile(null);
    setPreview(null);
    setConverted(null);
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8 border-b border-border-subtle pb-8">
        <div>
          <h2 className="text-4xl font-heading font-bold tracking-tight mb-2">Format Converter</h2>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase text-accent font-bold tracking-[0.2em]">
              [ Media Engine ]
            </span>
            <div className="w-1 h-1 rounded-full bg-soft-white/20" />
            <p className="font-mono text-[10px] uppercase text-soft-white/40 tracking-widest">
              Cross-format • Local processing
            </p>
          </div>
        </div>
        {converted && (
          <button 
            onClick={downloadImage}
            className="h-12 px-8 bg-accent text-primary-bg font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-accent/80 transition-subtle flex items-center gap-2"
          >
            <Download size={14} /> Download {targetFormat.label}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <Label className="font-mono text-[10px] uppercase tracking-widest text-soft-white/40">Source Image</Label>
          <div 
            onClick={() => !file && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative aspect-square border flex flex-col items-center justify-center transition-subtle cursor-pointer overflow-hidden ${isDragging ? 'border-accent bg-accent/10' : file ? 'border-border-subtle bg-white/[0.01]' : 'border-border-subtle hover:border-accent/40 hover:bg-accent/5 bg-white/[0.01]'}`}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-contain p-8" />
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 bg-white/[0.02] border border-border-subtle inline-block text-soft-white/20">
                  <ImageIcon size={32} strokeWidth={1} />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-soft-white/20">Drop image to convert</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
          
          {file && (
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-border-subtle">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase text-soft-white/40 tracking-widest mb-1">Source Format</span>
                <span className="text-soft-white font-medium text-xs font-mono">{file.type.split('/')[1].toUpperCase()}</span>
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
                <RefreshCcw size={14} className="text-accent" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-soft-white/60">Target Format</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {formats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setTargetFormat(format)}
                    className={`flex items-center justify-between p-6 border transition-subtle group ${targetFormat.id === format.id ? 'border-accent bg-accent/5' : 'border-border-subtle bg-transparent hover:bg-white/[0.02]'}`}
                  >
                    <span className={`font-mono text-xs uppercase tracking-widest ${targetFormat.id === format.id ? 'text-accent' : 'text-soft-white/40'}`}>{format.label}</span>
                    <div className={`w-2 h-2 rounded-full ${targetFormat.id === format.id ? 'bg-accent' : 'bg-soft-white/10'}`} />
                  </button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full h-14 bg-accent text-primary-bg hover:bg-accent/90 rounded-none font-mono text-[11px] uppercase tracking-[0.2em] transition-subtle disabled:opacity-30"
              disabled={!file || isProcessing}
              onClick={convertImage}
            >
              {isProcessing ? 'Converting...' : '[ Run Conversion ]'}
            </Button>
          </div>

          {converted && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 border border-accent/20 bg-accent/5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 text-accent">
                <CheckCircle2 size={16} />
                <span className="font-mono text-[10px] uppercase tracking-widest">Format conversion ready</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-[10px] uppercase text-accent/60 tracking-widest block mb-1">New Extension</span>
                <span className="text-lg font-bold text-accent font-mono">.{targetFormat.ext}</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageConverter;
