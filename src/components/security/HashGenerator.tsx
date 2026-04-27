"use client";
import React, { useState } from 'react';
import { Hash, Copy, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const HashGenerator = () => {
  const [text, setText] = useState('');
  const [hashes, setHashes] = useState({
    sha256: '',
    sha512: '',
  });
  const [copied, setCopied] = useState<string | null>(null);

  const generateHashes = async (val: string) => {
    setText(val);
    if (!val) {
      setHashes({ sha256: '', sha512: '' });
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(val);

    const hash256 = await crypto.subtle.digest('SHA-256', data);
    const hash512 = await crypto.subtle.digest('SHA-512', data);

    setHashes({
      sha256: bufferToHex(hash256),
      sha512: bufferToHex(hash512),
    });
  };

  const bufferToHex = (buffer: ArrayBuffer) => {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const copyHash = (hash: string, type: string) => {
    navigator.clipboard.writeText(hash);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12">
        <h2 className="text-3xl font-heading font-bold mb-4">Hash Generator</h2>
        <p className="text-soft-white/40 font-sans">
          Generate SHA-256 and SHA-512 hashes for text and files locally. 
          Useful for verifying file integrity and security audits.
        </p>
      </div>

      <div className="space-y-12">
        <div className="space-y-4">
          <Label className="font-mono text-[10px] uppercase tracking-widest text-soft-white/40">Input Text</Label>
          <textarea
            value={text}
            onChange={(e) => generateHashes(e.target.value)}
            placeholder="Enter text to hash..."
            className="w-full h-40 bg-white/[0.02] border border-border-subtle p-6 font-sans text-soft-white placeholder:text-soft-white/10 focus:border-accent/40 focus:bg-white/[0.04] transition-subtle outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          {Object.entries(hashes).map(([type, hash]) => (
            <div key={type} className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Hash size={14} className="text-accent" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-soft-white/60">{type.toUpperCase()}</span>
                </div>
                {hash && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyHash(hash, type)}
                    className={`font-mono text-[9px] uppercase tracking-widest transition-subtle ${copied === type ? 'text-accent' : 'text-soft-white/20 hover:text-accent'}`}
                  >
                    {copied === type ? '[ Copied ]' : '[ Copy Hash ]'}
                  </Button>
                )}
              </div>
              <div className="p-6 bg-white/[0.01] border border-border-subtle/50 font-mono text-[11px] break-all tracking-wider text-soft-white/80 leading-relaxed min-h-[60px]">
                {hash || <span className="text-soft-white/10 italic">Waiting for input...</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 p-6 border border-border-subtle/30 bg-white/[0.01]">
          <div className="p-3 border border-border-subtle text-accent/40">
            <FileCode size={20} strokeWidth={1} />
          </div>
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-soft-white/60 mb-1">Local Processing</h4>
            <p className="text-[12px] text-soft-white/20 font-sans">Hash calculations are performed using the Web Crypto API directly in your browser thread.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HashGenerator;
