"use client";
import React, { useState, useRef } from 'react';
import { QrCode, Download, Copy, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeGen = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#4ADE80');
  const [bgColor, setBgColor] = useState('#161616');
  const [copied, setCopied] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleDownload = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'sentin-qr.png';
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8 border-b border-border-subtle pb-8">
        <div>
          <h2 className="text-4xl font-heading font-bold tracking-tight mb-2">QR Generator</h2>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase text-accent font-bold tracking-[0.2em]">
              [ Secure Build ]
            </span>
            <div className="w-1 h-1 rounded-full bg-soft-white/20" />
            <p className="font-mono text-[10px] uppercase text-soft-white/40 tracking-widest">
              Instant generation • Zero tracking
            </p>
          </div>
        </div>
        <button 
          onClick={handleDownload}
          className="h-12 px-8 bg-accent text-primary-bg font-mono text-[10px] uppercase tracking-widest font-bold hover:bg-accent/80 transition-subtle flex items-center gap-2"
        >
          <Download size={14} /> Download PNG
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-soft-white/60 mb-4">Content / URL</label>
            <div className="relative">
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text or URL..."
                className="w-full bg-white/[0.02] border border-border-subtle p-6 font-sans text-sm focus:outline-none focus:border-accent/40 transition-subtle min-h-[160px] resize-none"
              />
              <button 
                onClick={copyToClipboard}
                className="absolute top-4 right-4 text-soft-white/20 hover:text-accent transition-subtle"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-soft-white/60 mb-4">Size (px)</label>
              <input 
                type="number" 
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full bg-white/[0.02] border border-border-subtle p-4 font-mono text-xs focus:outline-none focus:border-accent/40"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-soft-white/60 mb-4">Accent Color</label>
              <div className="flex gap-4">
                <input 
                  type="color" 
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-12 h-12 bg-transparent border-none cursor-pointer p-0"
                />
                <input 
                  type="text" 
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1 bg-white/[0.02] border border-border-subtle px-4 font-mono text-[10px] focus:outline-none uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-12 border border-border-subtle bg-white/[0.01] relative overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#4ADE80_1px,transparent_1px)] [background-size:20px_20px]" />
          
          <div className="bg-white p-6 shadow-2xl relative z-10">
            <QRCodeSVG 
              value={text || ' '} 
              size={size} 
              fgColor={fgColor} 
              bgColor="#FFFFFF"
              level="H"
              includeMargin={false}
              ref={svgRef}
            />
          </div>
          
          <div className="absolute bottom-8 font-mono text-[8px] uppercase tracking-[0.4em] text-soft-white/20">
            Rendered locally by Sentin
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGen;
