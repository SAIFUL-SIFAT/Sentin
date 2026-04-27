"use client";

import React from 'react';
import { Info } from 'lucide-react';

export default function Stub() {
  return (
    <div className="flex flex-col items-center justify-center p-20 border border-dashed border-border-subtle bg-white/[0.01] rounded-3xl">
      <div className="p-4 bg-accent/10 rounded-full mb-6 text-accent">
        <Info size={24} />
      </div>
      <h3 className="text-xl font-heading font-bold mb-2 uppercase tracking-tighter">Under Development</h3>
      <p className="text-soft-white/40 font-mono text-xs uppercase tracking-widest text-center max-w-xs">
        This tool is being optimized and will be available in a future update. All processing remains local.
      </p>
    </div>
  );
}
