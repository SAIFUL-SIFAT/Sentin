"use client";
import React, { useState } from 'react';
import { Shield, Search, Copy, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const HashAnalyzer = () => {
  const [hash, setHash] = useState('');
  const [analysis, setAnalysis] = useState<{ type: string; security: string; bits: number } | null>(null);

  const identifyHash = (value: string) => {
    const cleanHash = value.trim();
    setHash(cleanHash);

    if (!cleanHash) {
      setAnalysis(null);
      return;
    }

    const len = cleanHash.length;
    const isHex = /^[0-9a-fA-F]+$/.test(cleanHash);

    if (!isHex) {
      setAnalysis({ type: 'Unknown (Non-Hex)', security: 'Invalid', bits: 0 });
      return;
    }

    // Common Hash Lengths (Hex)
    let type = 'Unknown';
    let security = 'Unknown';
    let bits = len * 4;

    switch (len) {
      case 32:
        type = 'MD5';
        security = 'Vulnerable / Deprecated';
        break;
      case 40:
        type = 'SHA-1';
        security = 'Weak / Deprecated';
        break;
      case 56:
        type = 'SHA-224';
        security = 'Secure';
        break;
      case 64:
        type = 'SHA-256';
        security = 'Very Secure';
        break;
      case 96:
        type = 'SHA-384';
        security = 'Extremely Secure';
        break;
      case 128:
        type = 'SHA-512';
        security = 'Maximum Security';
        break;
      default:
        type = 'Custom / Unknown';
        security = 'Check Algorithm';
    }

    setAnalysis({ type, security, bits });
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8 border-b border-border-subtle pb-8">
        <div>
          <h2 className="text-4xl font-heading font-bold tracking-tight mb-2">Hash Analyzer</h2>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase text-accent font-bold tracking-[0.2em]">
              [ Security Audit ]
            </span>
            <div className="w-1 h-1 rounded-full bg-soft-white/20" />
            <p className="font-mono text-[10px] uppercase text-soft-white/40 tracking-widest">
              Algorithm detection • Local analysis
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <div className="space-y-4">
          <Label className="font-mono text-[10px] uppercase tracking-widest text-soft-white/40">Input Hash</Label>
          <div className="relative">
            <input
              type="text"
              value={hash}
              onChange={(e) => identifyHash(e.target.value)}
              placeholder="Paste hash here (e.g., d8578edf...)"
              className="w-full bg-white/[0.02] border border-border-subtle p-6 font-mono text-xs text-accent placeholder:text-soft-white/10 focus:border-accent/40 focus:bg-white/[0.04] transition-subtle outline-none"
            />
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-soft-white/10" size={18} />
          </div>
        </div>

        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            <AnalysisCard label="Detected Type" value={analysis.type} icon={Shield} />
            <AnalysisCard label="Security Rating" value={analysis.security} icon={AlertCircle} isWarning={analysis.security.includes('Weak') || analysis.security.includes('Vulnerable')} />
            <AnalysisCard label="Bit Length" value={`${analysis.bits}-bit`} icon={Info} />
          </div>
        )}

        <div className="p-8 border border-border-subtle bg-white/[0.01] space-y-6">
          <div className="flex items-center gap-3">
            <Info size={14} className="text-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-soft-white/60">What is Hash Detection?</span>
          </div>
          <p className="text-[13px] text-soft-white/40 font-sans leading-relaxed">
            Cryptographic hashes are "one-way" functions. While they cannot be reversed or "decrypted" in the traditional sense, they can be identified by their output length and structure. This tool uses pattern matching to determine which algorithm was likely used to create the hash.
          </p>
        </div>
      </div>
    </div>
  );
};

const AnalysisCard = ({ label, value, icon: Icon, isWarning }: { label: string, value: string, icon: any, isWarning?: boolean }) => (
  <div className={`p-8 border border-border-subtle bg-white/[0.02] flex flex-col justify-between transition-subtle hover:bg-white/[0.04]`}>
    <div className="flex items-center gap-3 mb-6">
      <Icon size={14} className={isWarning ? 'text-red-500' : 'text-accent'} />
      <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-soft-white/40">{label}</span>
    </div>
    <span className={`text-xl font-heading font-bold tracking-tight ${isWarning ? 'text-red-500' : 'text-soft-white'}`}>{value}</span>
  </div>
);

export default HashAnalyzer;
