"use client";
import React, { useState, useRef } from 'react';
import { Zap, Download, ImageIcon, Trash2, Sliders, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { motion } from 'motion/react';

const ImageCompressor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressed, setCompressed] = useState<string | null>(null);
  const [quality, setQuality] = useState([0.7]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [stats, setStats] = useState({ original: 0, compressed: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setCompressed(null);
    setStats({ original: selectedFile.size, compressed: 0 });
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

  const compressImage = () => {
    if (!file) return;
    setIsCompressing(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', quality[0]);
        setCompressed(dataUrl);
        
        // Calculate size from base64
        const stringLength = dataUrl.length - 'data:image/jpeg;base64,'.length;
        const sizeInBytes = Math.ceil(stringLength * 0.75);
        setStats(prev => ({ ...prev, compressed: sizeInBytes }));
        setIsCompressing(false);
      };
    };
  };

  const downloadImage = () => {
    if (!compressed) return;
    const link = document.createElement('a');
    link.href = compressed;
    link.download = `compressed-${file?.name.split('.')[0]}.jpg`;
    link.click();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clear = () => {
    setFile(null);
    setPreview(null);
    setCompressed(null);
    setStats({ original: 0, compressed: 0 });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-12">
        <h2 className="text-3xl font-heading font-bold mb-4">Image Compressor</h2>
        <p className="text-soft-white/40 font-sans">
          Compress and optimize your images locally. 
          Adjust quality settings to find the perfect balance between file size and visual clarity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Upload & Preview */}
        <div className="space-y-6">
          <Label className="font-mono text-[10px] uppercase tracking-widest text-soft-white/40">Source Image</Label>
          <div 
            onClick={() => !file && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative aspect-square border-2 border-dashed flex flex-col items-center justify-center transition-subtle cursor-pointer overflow-hidden ${isDragging ? 'border-accent bg-accent/10' : file ? 'border-border-subtle bg-white/[0.01]' : 'border-border-subtle/40 hover:border-accent/40 hover:bg-accent/5'}`}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-contain p-4" />
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 bg-white/[0.02] border border-border-subtle inline-block text-soft-white/20">
                  <ImageIcon size={32} strokeWidth={1} />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-soft-white/20">Click to upload or drop image</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
          
          {file && (
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-border-subtle">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase text-soft-white/40 tracking-widest mb-1">Original Size</span>
                <span className="text-soft-white font-medium">{formatSize(stats.original)}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={clear} className="text-soft-white/20 hover:text-red-500">
                <Trash2 size={16} />
              </Button>
            </div>
          )}
        </div>

        {/* Controls & Results */}
        <div className="space-y-8">
          <div className="p-8 border border-border-subtle bg-white/[0.02] space-y-12">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Sliders size={14} className="text-accent" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-soft-white/60">Compression Settings</span>
                </div>
                <span className="font-mono text-[10px] text-accent">{Math.round(quality[0] * 100)}% Quality</span>
              </div>
              <Slider 
                value={quality} 
                onValueChange={setQuality} 
                max={1} 
                min={0.1} 
                step={0.01}
                className="py-4"
                disabled={!file}
              />
            </div>

            <Button 
              className="w-full h-14 bg-accent text-primary-bg hover:bg-accent/90 rounded-none font-mono text-[11px] uppercase tracking-[0.2em] transition-subtle disabled:opacity-30"
              disabled={!file || isCompressing}
              onClick={compressImage}
            >
              {isCompressing ? 'Processing...' : '[ Run Compression ]'}
            </Button>
          </div>

          {compressed && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 border border-accent/20 bg-accent/5 space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-accent">
                  <CheckCircle2 size={16} />
                  <span className="font-mono text-[10px] uppercase tracking-widest">Compression Complete</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] uppercase text-accent/60 tracking-widest block mb-1">Savings</span>
                  <span className="text-xl font-bold text-accent">-{Math.round((1 - stats.compressed / stats.original) * 100)}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-primary-bg/40 border border-accent/20">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] uppercase text-accent/40 tracking-widest mb-1">New Size</span>
                  <span className="text-soft-white font-medium">{formatSize(stats.compressed)}</span>
                </div>
                <Button 
                  onClick={downloadImage}
                  className="bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-primary-bg transition-subtle rounded-none font-mono text-[10px] uppercase tracking-widest px-6"
                >
                  <Download size={14} className="mr-2" /> Download
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCompressor;
