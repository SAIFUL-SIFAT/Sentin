"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Maximize, 
  BookOpen, 
  Book, 
  Volume2, 
  VolumeX,
  Loader2,
  X
} from 'lucide-react';
import { PageFlip } from 'page-flip';

const FLIP_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3';

export default function PDFViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(0);
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSpread, setIsSpread] = useState<boolean>(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const flipBookRef = useRef<PageFlip | null>(null);
  const isSoundEnabledRef = useRef(isSoundEnabled);
  const currentPageRef = useRef(0);
  const lastSoundTimeRef = useRef(0);

  // Update sound ref
  useEffect(() => {
    isSoundEnabledRef.current = isSoundEnabled;
  }, [isSoundEnabled]);

  // Update page ref
  useEffect(() => {
    currentPageRef.current = pageNumber;
  }, [pageNumber]);

  const playFlipSound = () => {
    const now = Date.now();
    if (isSoundEnabledRef.current && now - lastSoundTimeRef.current > 500) {
      lastSoundTimeRef.current = now;
      const audio = new Audio(FLIP_SOUND_URL);
      audio.volume = 0.4;
      audio.play().catch(err => console.log("Sound play blocked or failed:", err));
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles[0]) setFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false
  });

  useEffect(() => {
    if (!file) {
      setPages([]);
      setNumPages(0);
      return;
    }

    const loadPdf = async () => {
      setLoading(true);
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;
        
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        const pageImages: string[] = [];
        let maxWidth = 0;
        let maxHeight = 0;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          if (i === 1 && viewport.width > viewport.height) {
            setIsSpread(false);
          }

          if (viewport.width > maxWidth) maxWidth = viewport.width;
          if (viewport.height > maxHeight) maxHeight = viewport.height;

          await page.render({ canvasContext: context!, viewport }).promise;
          pageImages.push(canvas.toDataURL('image/jpeg', 0.8));
        }

        // Logical dimensions for the flipbook (will be scaled by 'stretch')
        setDimensions({ width: maxWidth / 2, height: maxHeight / 2 });
        setPages(pageImages);
        setNumPages(pdf.numPages);
      } catch (error) {
        console.error('Error loading PDF:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [file]);

  useEffect(() => {
    if (pages.length > 0 && containerRef.current) {
      // Small timeout to ensure DOM is ready and previous instance is fully cleared
      const timer = setTimeout(() => {
        if (!containerRef.current) return;
        
        const flipBook = new PageFlip(containerRef.current, {
          width: dimensions.width,
          height: dimensions.height,
          size: "stretch" as any,
          minWidth: 315,
          maxWidth: 1000,
          minHeight: 420,
          maxHeight: 1350,
          maxShadowOpacity: 0.5,
          showCover: true,
          mobileScrollSupport: false,
          usePortrait: !isSpread,
          startPage: currentPageRef.current, // Preserve page on re-init
          drawShadow: true,
          flippingTime: 800,
          swipeDistance: 30,
          showPageCorners: true,
          disableFlipByClick: false,
        });

        flipBook.loadFromImages(pages);
        flipBookRef.current = flipBook;

        flipBook.on('flip', (e: any) => {
          setPageNumber(e.data as number);
        });

        flipBook.on('changeState', (e: any) => {
          if (e.data === 'flipping') {
            playFlipSound();
          }
        });
      }, 50);

      return () => {
        clearTimeout(timer);
        if (flipBookRef.current) {
          try {
            flipBookRef.current.destroy();
          } catch (e) {
            console.error("Error destroying flipbook:", e);
          }
        }
      };
    }
  }, [pages, isSpread, dimensions]);

  const handleNext = () => {
    playFlipSound();
    flipBookRef.current?.flipNext();
  };
  const handlePrev = () => {
    playFlipSound();
    flipBookRef.current?.flipPrev();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      <div className="mb-12 border-b border-border-subtle pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter flex items-center gap-3">
            <BookOpen className="text-accent" size={32} />
            PDF Book Viewer
          </h2>
          <p className="text-soft-white/60 mt-2 font-mono text-[10px] uppercase tracking-widest">Premium Realistic Reading Experience</p>
        </div>

        {file && !loading && (
          <div className="flex flex-wrap items-center gap-4 bg-white/[0.03] p-3 border-subtle rounded-xl backdrop-blur-md">
            <div className="flex items-center gap-1 font-mono text-xs">
              <button 
                onClick={handlePrev}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-soft-white/60 hover:text-accent"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="px-4 py-1 bg-white/5 rounded-md text-soft-white/80 min-w-[80px] text-center">
                Page {pageNumber + 1} <span className="text-soft-white/20">/</span> {numPages}
              </span>
              <button 
                onClick={handleNext}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-soft-white/60 hover:text-accent"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="w-px h-6 bg-white/10" />

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSpread(!isSpread)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all ${isSpread ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-white/5 text-soft-white/40 border border-white/5 hover:bg-white/10'}`}
                title={isSpread ? "Switch to Single Page" : "Switch to Spread View"}
              >
                {isSpread ? <BookOpen size={14} /> : <Book size={14} />}
                {isSpread ? "Spread" : "Single"}
              </button>

              <button 
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                className={`p-2 rounded-lg transition-all ${isSoundEnabled ? 'text-accent hover:bg-accent/10' : 'text-soft-white/20 hover:bg-white/10'}`}
                title={isSoundEnabled ? "Mute Sound" : "Enable Sound"}
              >
                {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>

            <div className="w-px h-6 bg-white/10" />

            <button 
              onClick={() => setFile(null)}
              className="p-2 text-soft-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              title="Close PDF"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      {!file ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed border-border-subtle py-48 flex flex-col items-center justify-center bg-white/[0.01] hover:bg-white/[0.03] transition-subtle cursor-pointer group rounded-[32px] ${isDragActive ? 'border-accent bg-accent/5' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="w-20 h-20 flex items-center justify-center bg-white/[0.02] border border-white/5 rounded-3xl mb-8 group-hover:scale-110 transition-transform duration-500">
            <Eye size={40} className="text-soft-white/10 group-hover:text-accent transition-subtle" />
          </div>
          <p className="font-mono text-sm uppercase tracking-[0.4em] text-soft-white/30 group-hover:text-soft-white/80 transition-subtle">Drop PDF to begin reading</p>
          <div className="mt-8 flex items-center gap-3 text-soft-white/20 font-mono text-[10px] uppercase tracking-widest">
            <Maximize size={12} />
            Realistic Flip Engine
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[70vh] relative">
          {loading ? (
            <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
              <div className="relative">
                <Loader2 size={48} className="text-accent animate-spin" />
                <div className="absolute inset-0 blur-xl bg-accent/20 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-mono text-sm uppercase tracking-[0.3em] text-soft-white/80">Rendering Pages</p>
                <p className="text-[10px] font-mono text-soft-white/30 mt-2 uppercase">Please wait while we prepare your book...</p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center items-center py-12 bg-black/20 rounded-[48px] shadow-inner border border-white/5 backdrop-blur-sm overflow-hidden">
              <div 
                ref={containerRef} 
                key={isSpread ? 'spread' : 'single'}
                className="flip-book-container shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)]"
              >
                {/* page-flip will inject pages here */}
              </div>
            </div>
          )}
          
          {!loading && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-soft-white/40 font-mono text-[10px] uppercase tracking-[0.2em]">
              <div className="flex items-center gap-3 group/tip cursor-help">
                <kbd className="px-2.5 py-1.5 bg-white/10 rounded-lg border border-white/10 text-soft-white/80 group-hover/tip:border-accent/50 group-hover/tip:text-accent group-hover/tip:bg-accent/5 transition-all duration-300 shadow-sm">Mouse Drag</kbd>
                <span className="group-hover/tip:text-soft-white/80 transition-colors">to flip pages</span>
              </div>
              <div className="w-1 h-1 bg-white/20 rounded-full" />
              <div className="flex items-center gap-3 group/tip cursor-help">
                <kbd className="px-2.5 py-1.5 bg-white/10 rounded-lg border border-white/10 text-soft-white/80 group-hover/tip:border-accent/50 group-hover/tip:text-accent group-hover/tip:bg-accent/5 transition-all duration-300 shadow-sm">Double Click</kbd>
                <span className="group-hover/tip:text-soft-white/80 transition-colors">to zoom in</span>
              </div>
              <div className="w-1 h-1 bg-white/20 rounded-full" />
              <div className="flex items-center gap-3 group/tip cursor-help">
                <kbd className="px-2.5 py-1.5 bg-white/10 rounded-lg border border-white/10 text-soft-white/80 group-hover/tip:border-accent/50 group-hover/tip:text-accent group-hover/tip:bg-accent/5 transition-all duration-300 shadow-sm">Arrows</kbd>
                <span className="group-hover/tip:text-soft-white/80 transition-colors">to navigate</span>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        .flip-book-container {
          background-color: transparent;
          display: block;
        }
        
        .stPageFlip {
          position: relative;
          background-color: #111;
        }

        .page-content {
          background-color: white;
          overflow: hidden;
        }

        /* Shadow effect for the spine */
        .stPageFlip::after {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 100%;
          background: linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2));
          z-index: 20;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

