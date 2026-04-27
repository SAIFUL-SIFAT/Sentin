"use client";
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Copy, Check, Braces, AlertCircle, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface DecodedJWT {
  header: any;
  payload: any;
  signature: string;
}

const JWTDecoder = () => {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const decodeJWT = (val: string) => {
    setToken(val);
    setError(null);
    if (!val) {
      setDecoded(null);
      return;
    }

    try {
      const parts = val.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT: A token must have 3 parts separated by dots.');
      }

      const decodePart = (part: string) => {
        try {
          return JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
        } catch (e) {
          return null;
        }
      };

      setDecoded({
        header: decodePart(parts[0]),
        payload: decodePart(parts[1]),
        signature: parts[2],
      });
    } catch (e: any) {
      setError(e.message);
      setDecoded(null);
    }
  };

  const copySection = (data: any, section: string) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8 border-b border-border-subtle pb-8">
        <div>
          <h2 className="text-4xl font-heading font-bold tracking-tight mb-2">JWT Decoder</h2>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase text-accent font-bold tracking-[0.2em]">
              [ Security Engine ]
            </span>
            <div className="w-1 h-1 rounded-full bg-soft-white/20" />
            <p className="font-mono text-[10px] uppercase text-soft-white/40 tracking-widest">
              Header • Payload • Claims identification
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <div className="space-y-4">
          <Label className="font-mono text-[10px] uppercase tracking-widest text-soft-white/40">Input Token</Label>
          <textarea
            value={token}
            onChange={(e) => decodeJWT(e.target.value)}
            placeholder="Paste your JWT here..."
            className="w-full h-32 bg-white/[0.02] border border-border-subtle p-6 font-mono text-xs text-accent placeholder:text-soft-white/10 focus:border-accent/40 focus:bg-white/[0.04] transition-subtle outline-none resize-none"
          />
          {error && (
            <div className="flex items-center gap-2 text-red-500 font-mono text-[10px] uppercase tracking-widest mt-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>

        {decoded && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-12">
              <Section 
                title="Header" 
                data={decoded.header} 
                onCopy={() => copySection(decoded.header, 'header')} 
                isCopied={copiedSection === 'header'} 
              />
              <Section 
                title="Payload" 
                data={decoded.payload} 
                onCopy={() => copySection(decoded.payload, 'payload')} 
                isCopied={copiedSection === 'payload'} 
              />
            </div>
            
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={14} className="text-accent" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-soft-white/60">Signature</span>
                  </div>
                </div>
                <div className="p-8 border border-border-subtle bg-white/[0.01] font-mono text-[11px] break-all leading-relaxed text-soft-white/20">
                  {decoded.signature}
                </div>
              </div>

              <div className="p-8 border border-border-subtle bg-accent/5 space-y-6">
                <div className="flex items-center gap-3">
                  <Info size={14} className="text-accent" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-accent/60">Local Privacy Note</span>
                </div>
                <p className="text-[13px] text-soft-white/40 font-sans leading-relaxed">
                  Decoding is performed using browser-native base64 functions. Your token is never sent to any server, preventing accidental leaks of sensitive authentication claims.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Section = ({ title, data, onCopy, isCopied }: { title: string, data: any, onCopy: () => void, isCopied: boolean }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Braces size={14} className="text-accent" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-soft-white/60">{title}</span>
      </div>
      <button 
        onClick={onCopy}
        className={`font-mono text-[9px] uppercase tracking-widest transition-subtle ${isCopied ? 'text-accent' : 'text-soft-white/20 hover:text-accent'}`}
      >
        {isCopied ? '[ Copied ]' : '[ Copy JSON ]'}
      </button>
    </div>
    <div className="p-8 border border-border-subtle bg-white/[0.01] font-mono text-[12px] leading-relaxed text-soft-white/80 overflow-x-auto whitespace-pre">
      {data ? JSON.stringify(data, null, 2) : <span className="text-red-500/60 italic">Error decoding part</span>}
    </div>
  </div>
);

export default JWTDecoder;
