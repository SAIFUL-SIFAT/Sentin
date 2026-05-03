"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  FileCode,
  Files,
  ArrowLeft,
  Download,
  Plus,
  Github,
  Info,
  ExternalLink,
  Zap,
  QrCode,
  Lock,
  Hash,
  Braces,
  GitCompare,
  Layout,
  Maximize,
  Shield,
  RefreshCcw,
  ShieldCheck,
  ListOrdered
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'motion/react';

// --- Imports for tools ---
import dynamic from 'next/dynamic';

const WordEditor = dynamic(() => import('@/components/documents/WordEditor'), { ssr: false });
const MarkdownEditor = dynamic(() => import('@/components/documents/MarkdownEditor'), { ssr: false });

// Stubs for components not yet pushed to prevent build errors
const PDFMerge = dynamic(() => import('@/components/pdf/PDFMerge'), { ssr: false });
const PDFSplit = dynamic(() => import('@/components/pdf/PDFSplit'), { ssr: false });
const PDFViewer = dynamic(() => import('@/components/pdf/PDFViewer'), { ssr: false });
const ImageToPDF = dynamic(() => import('@/components/pdf/ImageToPDF'), { ssr: false });
const CodeEditor = dynamic(() => import('@/components/developer/CodeEditor'), { ssr: false });
const ImageCompressor = dynamic(() => import('@/components/media/ImageCompressor'), { ssr: false });
const QRCodeGen = dynamic(() => import('@/components/media/QRCodeGen'), { ssr: false });
const PasswordGen = dynamic(() => import('@/components/security/PasswordGen'), { ssr: false });
const HashGenerator = dynamic(() => import('@/components/security/HashGenerator'), { ssr: false });
const JSONFormatter = dynamic(() => import('@/components/developer/JSONFormatter'), { ssr: false });
const DiffChecker = dynamic(() => import('@/components/developer/DiffChecker'), { ssr: false });
const ImageResizer = dynamic(() => import('@/components/media/ImageResizer'), { ssr: false });
const HashAnalyzer = dynamic(() => import('@/components/security/HashAnalyzer'), { ssr: false });
const ImageConverter = dynamic(() => import('@/components/media/ImageConverter'), { ssr: false });
const JWTDecoder = dynamic(() => import('@/components/security/JWTDecoder'), { ssr: false });
const PDFReorder = dynamic(() => import('@/components/pdf/PDFReorder'), { ssr: false });


import MacOSDock, { DockApp } from '@/components/ui/mac-os-dock';
import MinimalistDock from '@/components/ui/minimal-dock';

type View = string;

const categories = [
  {
    id: 'documents',
    name: 'Documents',
    icon: <FileText size={20} />,
    tools: [
      { id: 'word', name: 'Word Editor', icon: <FileText size={16} /> },
      { id: 'markdown', name: 'Markdown', icon: <Files size={16} /> },
    ]
  },
  {
    id: 'pdf',
    name: 'PDF Suite',
    icon: <Layout size={20} />,
    tools: [
      { id: 'pdf-viewer', name: 'Viewer', icon: <Maximize size={16} /> },
      { id: 'pdf-merge', name: 'Merge', icon: <Plus size={16} /> },
      { id: 'pdf-split', name: 'Split', icon: <GitCompare size={16} /> },
      { id: 'pdf-reorder', name: 'Reorder', icon: <ListOrdered size={16} /> },
      { id: 'image-to-pdf', name: 'Img to PDF', icon: <FileText size={16} /> },
    ]
  },
  {
    id: 'media',
    name: 'Media',
    icon: <Zap size={20} />,
    tools: [
      { id: 'image-compressor', name: 'Compressor', icon: <Zap size={16} /> },
      { id: 'image-resizer', name: 'Resizer', icon: <Maximize size={16} /> },
      { id: 'image-converter', name: 'Converter', icon: <RefreshCcw size={16} /> },
      { id: 'qr-generator', name: 'QR Gen', icon: <QrCode size={16} /> },
    ]
  },
  {
    id: 'security',
    name: 'Security',
    icon: <ShieldCheck size={20} />,
    tools: [
      { id: 'password-gen', name: 'Password', icon: <Lock size={16} /> },
      { id: 'hash-gen', name: 'Hasher', icon: <Hash size={16} /> },
      { id: 'hash-analyzer', name: 'Analyzer', icon: <Shield size={16} /> },
      { id: 'jwt-decoder', name: 'JWT Decoder', icon: <ShieldCheck size={16} /> },
    ]
  },
  {
    id: 'developer',
    name: 'Developer',
    icon: <Braces size={20} />,
    tools: [
      { id: 'code', name: 'Code Editor', icon: <FileCode size={16} /> },
      { id: 'json-formatter', name: 'JSON Format', icon: <Braces size={16} /> },
      { id: 'diff-checker', name: 'Diff Check', icon: <GitCompare size={16} /> },
    ]
  },
];

const ToolDock = ({ onOpenTool, currentView }: { onOpenTool: (v: View) => void, currentView: View }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveCategory(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 300);
  };

  const dockApps: DockApp[] = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    icon: (
      <div className="text-soft-white/60 group-hover/item:text-accent transition-colors">
        {cat.icon}
      </div>
    ),
    content: (
      <AnimatePresence>
        {activeCategory === cat.id && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            className="bg-[#141414]/90 backdrop-blur-3xl border border-white/10 p-4 rounded-[28px] flex flex-col items-center gap-4 shadow-[0_25px_60px_rgba(0,0,0,0.8)] min-w-[200px]"
            onMouseEnter={() => handleMouseEnter(cat.id)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="px-2 pb-2 border-b border-white/5 w-full text-left">
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-soft-white/60">{cat.name}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              {cat.tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenTool(tool.id as View);
                  }}
                  className="flex flex-col items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-all group/tool min-w-[90px]"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-white/[0.03] border border-white/5 rounded-2xl text-soft-white/70 group-hover/tool:text-accent group-hover/tool:bg-accent/10 group-hover/tool:border-accent/30 transition-all">
                    {tool.icon}
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-soft-white/80 group-hover/tool:text-white text-center leading-tight max-w-[80px]">
                    {tool.name}
                  </span>
                </button>
              ))}
            </div>
            {/* Triangle pointer */}
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#141414] border-r border-t border-white/10 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    )
  }));

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-[100] pointer-events-auto hidden md:block">
      <MacOSDock
        apps={dockApps}
        onAppClick={(id) => {
          onOpenTool(`category:${id}`);
        }}
        onAppHover={(id, isHovering) => {
          if (isHovering) {
            handleMouseEnter(id);
          } else {
            handleMouseLeave();
          }
        }}
        openApps={categories.filter(cat => cat.tools.some(t => t.id === currentView) || currentView === `category:${cat.id}`).map(c => c.id)}
      />
    </div>
  );
};

const Hero = ({ onOpenTool }: { onOpenTool: (v: View) => void }) => {
  const container: Variants = {
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item: Variants = {
    hidden: { y: 100, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    },
  };

  return (
    <div className="relative pt-20 md:pt-32 pb-16 md:pb-24 px-6 lg:px-12 flex flex-col items-start text-left overflow-hidden">
      <div className="grid-background" />
      <motion.h1
        variants={container}
        initial="hidden"
        animate="show"
        className="text-[48px] sm:text-[64px] lg:text-[110px] font-heading font-bold leading-[0.9] lg:leading-[0.85] tracking-[-0.04em] mb-12"
      >
        <div className="overflow-hidden">
          <motion.div variants={item}>Edit documents<span className="text-accent">.</span></motion.div>
        </div>
        <div className="overflow-hidden">
          <motion.div variants={item}>Merge PDFs<span className="text-accent">.</span></motion.div>
        </div>
        <div className="overflow-hidden">
          <motion.div variants={item}>No accounts<span className="text-accent">.</span></motion.div>
        </div>
        <div className="overflow-hidden">
          <motion.div variants={item}>No uploads<span className="text-accent">.</span></motion.div>
        </div>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="flex flex-col items-start gap-8 md:gap-12"
      >
        <p className="text-[15px] md:text-[17px] text-soft-white/80 max-w-[480px] leading-relaxed">
          Your files never leave your device. All tools run entirely in your browser using local resources.
          Professional-grade editing with zero compromise on privacy.
        </p>

        <div className="flex items-center gap-8">
          <button
            onClick={() => onOpenTool('word')}
            className="text-accent hover:text-accent/80 transition-subtle font-mono text-xs uppercase tracking-[0.2em] flex items-center gap-2"
          >
            [ Open word editor ]
          </button>
          <div className="flex items-center gap-3 text-soft-white/40 font-mono text-[10px] uppercase tracking-widest">
            <ShieldCheck size={14} className="text-accent/40" />
            Runs locally
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ToolCard = ({ name, description, icon: Icon, onClick }: { name: string, description: string, icon: any, onClick: () => void }) => (
  <div
    onClick={onClick}
    className="group flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 lg:p-12 md:pr-40 border-b border-border-subtle hover:bg-white/[0.02] transition-subtle cursor-pointer"
  >
    <div className="flex items-start gap-8 mb-6 sm:mb-0">
      <div className="p-4 border border-border-subtle group-hover:border-accent/40 group-hover:bg-accent/5 transition-subtle">
        <Icon size={24} strokeWidth={1.5} className="text-soft-white/60 group-hover:text-accent transition-subtle" />
      </div>
      <div>
        <h3 className="text-[22px] font-heading font-medium tracking-tight mb-2 group-hover:text-accent transition-subtle">{name}</h3>
        <p className="text-soft-white/60 text-[15px] font-sans max-w-md leading-relaxed">{description}</p>
      </div>
    </div>
    <div className="flex items-center gap-12 font-mono text-[10px] text-soft-white/40 group-hover:text-accent transition-subtle uppercase tracking-[0.2em]">
      <span className="hidden sm:inline">Local processing</span>
      <span className="px-4 py-2 border border-border-subtle group-hover:border-accent/40 group-hover:bg-accent/5 transition-subtle">Open</span>
    </div>
  </div>
);

const ALL_TOOLS = [
  { id: 'word', name: 'Word Editor', description: 'Advanced rich text editing with .docx import/export capabilities.', icon: FileText, category: 'documents' },
  { id: 'markdown', name: 'Markdown', description: 'Professional markdown editor with real-time preview and export.', icon: Files, category: 'documents' },
  { id: 'pdf-viewer', name: 'PDF Viewer', description: 'View and navigate PDF documents securely.', icon: Maximize, category: 'pdf' },
  { id: 'pdf-merge', name: 'PDF Merge', description: 'Merge multiple PDF documents securely in your browser.', icon: Plus, category: 'pdf' },
  { id: 'pdf-split', name: 'PDF Split', description: 'Split PDF documents securely in your browser.', icon: GitCompare, category: 'pdf' },
  { id: 'pdf-reorder', name: 'PDF Reorder', description: 'Reorder pages in a PDF document securely.', icon: ListOrdered, category: 'pdf' },
  { id: 'image-to-pdf', name: 'Image to PDF', description: 'Convert images to PDF format securely.', icon: FileText, category: 'pdf' },
  { id: 'image-compressor', name: 'Image Compressor', description: 'Privacy-first image optimization with local Canvas processing.', icon: Zap, category: 'media' },
  { id: 'image-resizer', name: 'Image Resizer', description: 'Pixel-perfect image scaling with aspect ratio locking and high-quality interpolation.', icon: Maximize, category: 'media' },
  { id: 'image-converter', name: 'Format Converter', description: 'Cross-convert images between JPEG, PNG, and WebP instantly.', icon: RefreshCcw, category: 'media' },
  { id: 'qr-generator', name: 'QR Generator', description: 'Create secure, customizable QR codes entirely in your browser.', icon: QrCode, category: 'media' },
  { id: 'password-gen', name: 'Password Generator', description: 'Generate strong, secure passwords locally.', icon: Lock, category: 'security' },
  { id: 'hash-gen', name: 'Hash Generator', description: 'Generate various hashes locally.', icon: Hash, category: 'security' },
  { id: 'hash-analyzer', name: 'Hash Analyzer', description: 'Identify hash types (MD5, SHA-256) and audit their security strength.', icon: Shield, category: 'security' },
  { id: 'jwt-decoder', name: 'JWT Decoder', description: 'Deeply inspect JSON Web Tokens locally to verify claims and headers.', icon: ShieldCheck, category: 'security' },
  { id: 'code', name: 'Code Editor', description: 'Advanced code editor with syntax highlighting.', icon: FileCode, category: 'developer' },
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Format and validate JSON locally.', icon: Braces, category: 'developer' },
  { id: 'diff-checker', name: 'Diff Checker', description: 'Compare text and code locally.', icon: GitCompare, category: 'developer' }
];

const ToolList = ({ onOpenTool, filterCategory }: { onOpenTool: (v: View) => void, filterCategory?: string }) => {
  const toolsToShow = filterCategory ? ALL_TOOLS.filter(t => t.category === filterCategory) : ALL_TOOLS;

  return (
    <div className={filterCategory ? "-mx-6 lg:-mx-12 -mt-6 lg:-mt-12" : "mt-12 border-t border-border-subtle"}>
      <div className="px-6 lg:px-12 md:pr-40 py-12 border-b border-border-subtle bg-white/[0.01]">
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-soft-white/40">
          {filterCategory ? `${categories.find(c => c.id === filterCategory)?.name} Utilities` : 'Available Utilities'}
        </span>
      </div>
      {toolsToShow.map(tool => (
        <ToolCard
          key={tool.id}
          name={tool.name}
          description={tool.description}
          icon={tool.icon}
          onClick={() => onOpenTool(tool.id)}
        />
      ))}
    </div>
  );
};

export default function Home() {
  const [view, setView] = useState<View>('home');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <div className="flex flex-col w-full min-h-screen bg-transparent">
        <header className="sticky top-0 z-40 h-16 flex items-center px-6 lg:px-12 border-b border-border-subtle/30 bg-[#161616]/80 backdrop-blur-md">
          <div className="flex-1">
            <span className="font-heading font-bold text-lg text-[#4ADE80] tracking-tighter">Sentin</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/SAIFUL-SIFAT/Sentin" target="_blank" className="text-soft-white/20 hover:text-soft-white transition-subtle">
              <Github size={18} strokeWidth={1.5} />
            </a>
          </div>
        </header>

        <main className="flex-1">
          <AnimatePresence mode="wait">
            {view === 'home' ? (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Hero onOpenTool={setView} />

                <footer className="px-6 lg:px-12 py-16 border-t border-border-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-12 text-soft-white/40 text-[10px] font-mono uppercase tracking-[0.2em]">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-accent/40" />
                      <span className="font-heading font-bold tracking-tighter text-soft-white/80 text-lg">Sentin</span>
                    </div>
                    <p>© 2024 • Editorial Tool Ecosystem</p>
                  </div>
                  <div className="flex gap-16">
                    <div className="flex flex-col gap-4">
                      <span className="text-soft-white/60">Privacy</span>
                      <a href="#" className="hover:text-accent transition-subtle">No cookies</a>
                      <a href="#" className="hover:text-accent transition-subtle">Zero tracking</a>
                    </div>
                    <div className="flex flex-col gap-4">
                      <span className="text-soft-white/60">Security</span>
                      <a href="#" className="hover:text-accent transition-subtle">Sandboxed</a>
                      <a href="#" className="hover:text-accent transition-subtle">Audit logs</a>
                    </div>
                  </div>
                </footer>
              </motion.div>
            ) : (
              <motion.div
                key={view}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`p-6 lg:p-12 pb-32 md:pb-12 ${view.startsWith('category:') ? '' : 'md:pr-32 lg:pr-48'}`}
              >
                <button
                  onClick={() => setView('home')}
                  className="mb-12 flex items-center gap-3 text-soft-white/40 hover:text-accent transition-subtle font-mono text-[10px] uppercase tracking-[0.2em]"
                >
                  <ArrowLeft size={14} />
                  [ Back to Dashboard ]
                </button>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {view.startsWith('category:') ? (
                    <ToolList onOpenTool={setView} filterCategory={view.split(':')[1]} />
                  ) : (
                    <>
                      {view === 'word' && <WordEditor />}
                      {view === 'markdown' && <MarkdownEditor />}
                      {view === 'pdf-merge' && <PDFMerge />}
                      {view === 'pdf-split' && <PDFSplit />}
                      {view === 'pdf-viewer' && <PDFViewer />}
                      {view === 'pdf-reorder' && <PDFReorder />}
                      {view === 'image-to-pdf' && <ImageToPDF />}
                      {view === 'code' && <CodeEditor />}
                      {view === 'image-compressor' && <ImageCompressor />}
                      {view === 'image-resizer' && <ImageResizer />}
                      {view === 'image-converter' && <ImageConverter />}
                      {view === 'qr-generator' && <QRCodeGen />}
                      {view === 'password-gen' && <PasswordGen />}
                      {view === 'hash-gen' && <HashGenerator />}
                      {view === 'hash-analyzer' && <HashAnalyzer />}
                      {view === 'jwt-decoder' && <JWTDecoder />}
                      {view === 'json-formatter' && <JSONFormatter />}
                      {view === 'diff-checker' && <DiffChecker />}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      <ToolDock onOpenTool={setView} currentView={view} />
      <MinimalistDock currentView={view} onViewChange={setView} />
    </>
  );
}
