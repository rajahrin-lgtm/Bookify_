import React, { useEffect, useState, useRef, useCallback } from 'react';
import { X, BookOpen, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, Play, Pause, Square, Settings, List, Trash2, AlignLeft, Type, AlertTriangle } from 'lucide-react';
import { CommunityBook, LocalBook } from '../types';

interface ReaderProps {
  // Supports both LocalBook (file object) and CommunityBook (url)
  book: LocalBook | CommunityBook;
  onClose: () => void;
  onDelete?: (book: CommunityBook) => void;
}

// Sub-component to render a single PDF page with Lazy Loading
const PDFPage: React.FC<{
  pdf: any;
  pageNumber: number;
  scale: number;
  forceRender?: boolean;
  onInView?: (page: number) => void;
}> = ({ pdf, pageNumber, scale, forceRender = false, onInView }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(forceRender);
  const [pageDimensions, setPageDimensions] = useState<{width: number, height: number} | null>(null);

  // Lazy Load Observer
  useEffect(() => {
    if (forceRender) {
        setIsVisible(true);
        return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          if (onInView) onInView(pageNumber);
          observer.disconnect(); // Load once and stay loaded
        }
      },
      { 
        rootMargin: '100% 0px', // Start loading 1 screen away
        threshold: 0.1 
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [forceRender, pageNumber, onInView]);

  useEffect(() => {
    // Only render if visible and PDF is available
    if (!isVisible || !pdf) return;
    
    let renderTask: any = null;

    const renderPage = async () => {
      setLoading(true);

      try {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        
        // Update dimensions state
        setPageDimensions({ width: viewport.width, height: viewport.height });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Support high DPI screens
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        renderTask = page.render({
          canvasContext: context,
          transform: transform,
          viewport: viewport
        });

        await renderTask.promise;
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    renderPage();

    return () => {
      if (renderTask) renderTask.cancel();
    };
  }, [pdf, pageNumber, scale, isVisible]);

  // Calculate container style
  const width = pageDimensions ? pageDimensions.width : 600 * scale;
  const height = pageDimensions ? pageDimensions.height : 850 * scale;

  return (
    <div 
      ref={containerRef}
      id={`page-container-${pageNumber}`}
      className="relative my-4 shadow-lg bg-white transition-all duration-200 mx-auto"
      style={{ 
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: '100%',
      }}
    >
      {isVisible && <canvas ref={canvasRef} className="block" />}
      
      {(loading || !isVisible) && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10 border border-slate-100">
          {!forceRender && (
             <div className="flex flex-col items-center gap-2 text-slate-400">
               <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
               <span className="text-xs font-medium">Page {pageNumber}</span>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export const Reader: React.FC<ReaderProps> = ({ book, onClose, onDelete }) => {
  // Common State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // PDF State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0); // Used for PDF zoom and EPUB font size
  const [viewMode, setViewMode] = useState<'scroll' | 'page'>('scroll');
  
  // Text State
  const [textContent, setTextContent] = useState<string | null>(null);

  // EPUB State
  const [epubRendition, setEpubRendition] = useState<any>(null);
  const [epubBook, setEpubBook] = useState<any>(null);
  
  // TTS State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speakingPage, setSpeakingPage] = useState<number | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1.0);
  const [showTTSSettings, setShowTTSSettings] = useState(false);
  
  // Sidebar State
  const [showSidebar, setShowSidebar] = useState(false);

  // References
  const shouldReadRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const epubContainerRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  // Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> to avoid type errors
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Progress Saving Logic ---
  const STORAGE_KEY = `bookify_progress_${book.id}`;

  const saveProgress = useCallback((data: { page?: number; cfi?: string; scroll?: number }) => {
    // Debounce saving
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const existing = localStorage.getItem(STORAGE_KEY);
        const previous = existing ? JSON.parse(existing) : {};
        const payload = JSON.stringify({
          ...previous,
          ...data,
          lastRead: Date.now()
        });
        localStorage.setItem(STORAGE_KEY, payload);
      } catch (e) {
        console.error("Failed to save progress", e);
      }
    }, 500);
  }, [STORAGE_KEY]);

  const getSavedProgress = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }, [STORAGE_KEY]);

  // Determine Format
  const getFormat = () => {
      if ('format' in book && book.format && ['pdf', 'epub', 'txt'].includes(book.format)) {
          return book.format;
      }
      if ('file' in book && book.file) {
          if (book.file.type === 'application/pdf') return 'pdf';
          if (book.file.type === 'text/plain') return 'txt';
          if (book.file.type === 'application/epub+zip') return 'epub';
      }
      const titleLower = book.title.toLowerCase();
      if (titleLower.endsWith('.pdf')) return 'pdf';
      if (titleLower.endsWith('.txt')) return 'txt';
      if (titleLower.endsWith('.epub')) return 'epub';
      
      if ('url' in book && book.url) {
           const urlLower = book.url.toLowerCase().split('?')[0];
           if (urlLower.endsWith('.pdf')) return 'pdf';
           if (urlLower.endsWith('.txt')) return 'txt';
           if (urlLower.endsWith('.epub')) return 'epub';
      }
      if ('format' in book && book.format) return book.format;
      return 'other';
  };

  const format = getFormat();
  const isPdf = format === 'pdf';
  const isTxt = format === 'txt';
  const isEpub = format === 'epub';
  const isSupported = isPdf || isTxt || isEpub;

  // --- Zoom/Font Controls ---
  const handleZoomIn = () => {
    if (isEpub) {
        const newSize = Math.min(Math.round((scale + 0.1) * 100), 200);
        setScale(newSize / 100);
        if (epubRendition) epubRendition.themes.fontSize(`${newSize}%`);
    } else {
        setScale(prev => Math.min(prev + 0.1, 3.0));
    }
  };

  const handleZoomOut = () => {
    if (isEpub) {
        const newSize = Math.max(Math.round((scale - 0.1) * 100), 50);
        setScale(newSize / 100);
        if (epubRendition) epubRendition.themes.fontSize(`${newSize}%`);
    } else {
        setScale(prev => Math.max(prev - 0.1, 0.4));
    }
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '=' || e.key === '+') { e.preventDefault(); handleZoomIn(); }
      if (e.key === '-' || e.key === '_') { e.preventDefault(); handleZoomOut(); }
      if (e.key === '0') { e.preventDefault(); setScale(1.0); if(isEpub && epubRendition) epubRendition.themes.fontSize('100%'); }
      if (e.key === 'ArrowRight' && isEpub) { e.preventDefault(); epubRendition?.next(); }
      if (e.key === 'ArrowLeft' && isEpub) { e.preventDefault(); epubRendition?.prev(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [epubRendition, isEpub, scale]);

  // --- Voice Loading ---
  useEffect(() => {
    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
         const defaultVoice = availableVoices.find(v => v.default) || availableVoices[0];
         setSelectedVoice(defaultVoice);
      }
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null; }
  }, [selectedVoice]);


  // --- Cleanup ---
  useEffect(() => {
      return () => {
          shouldReadRef.current = false;
          synthRef.current.cancel();
          if (epubBook) epubBook.destroy();
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      };
  }, []);

  // --- Navigation (PDF) ---
  const goToPage = useCallback((page: number) => {
    const p = Math.max(1, Math.min(page, numPages));
    setCurrentPage(p);
    saveProgress({ page: p });
    
    // Scroll logic
    if (containerRef.current) {
        const pageElement = document.getElementById(`page-container-${p}`);
        if (pageElement) {
             pageElement.scrollIntoView({ behavior: 'auto', block: 'start' });
        } else if (p === 1) {
            containerRef.current.scrollTop = 0;
        }
    }
  }, [numPages, saveProgress]);

  // --- Content Loading ---

  // 1. Load PDF
  useEffect(() => {
    if (!isPdf) return;
    
    const loadPdf = async () => {
      setLoading(true);
      setError(null);
      try {
        const pdfjsModule = await import('pdfjs-dist');
        const pdfjsLib = pdfjsModule.default || pdfjsModule;
        const workerVersion = '3.11.174';
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${workerVersion}/build/pdf.worker.min.js`;
        }
        const CMAP_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${workerVersion}/cmaps/`;
        const STANDARD_FONT_DATA_URL = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${workerVersion}/standard_fonts/`;
        
        // Prepare PDF Source
        const loadingParams: any = {
           cMapUrl: CMAP_URL,
           cMapPacked: true,
           standardFontDataUrl: STANDARD_FONT_DATA_URL,
        };

        if ('file' in book && book.file) {
             loadingParams.data = await book.file.arrayBuffer();
        } else if ('url' in book && book.url) {
             loadingParams.url = book.url;
        } else {
             throw new Error("No PDF source found");
        }

        const loadingTask = pdfjsLib.getDocument(loadingParams);

        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setNumPages(doc.numPages);

        // Resume Progress
        const saved = getSavedProgress();
        if (saved?.page && saved.page <= doc.numPages) {
            setCurrentPage(saved.page);
            // Slight delay to allow render, then scroll
            setTimeout(() => {
                const pageElement = document.getElementById(`page-container-${saved.page}`);
                if (pageElement) pageElement.scrollIntoView({ behavior: 'auto', block: 'start' });
            }, 500);
        }

      } catch (err: any) {
        console.error("PDF Load Error:", err);
        setError(`Failed to load PDF. ${err.message || ''}`);
      } finally {
        setLoading(false);
      }
    };
    loadPdf();
    return () => {
       if (pdfDoc) pdfDoc.destroy().catch(() => {});
    };
  }, [book, isPdf, getSavedProgress]);

  // 2. Load Text
  useEffect(() => {
      if (!isTxt) return;
      const loadText = async () => {
          setLoading(true);
          try {
             let text = '';
             if ('file' in book && book.file) {
                 text = await book.file.text();
             } else if ('url' in book && book.url) {
                 const res = await fetch(book.url);
                 if (!res.ok) throw new Error("Failed to load file.");
                 text = await res.text();
             }
             setTextContent(text);
             
             // Resume Scroll Position after render
             const saved = getSavedProgress();
             if (saved?.scroll && containerRef.current) {
                 setTimeout(() => {
                     if (containerRef.current) containerRef.current.scrollTop = saved.scroll;
                 }, 100);
             }

          } catch (e) {
             setError("Failed to load text content.");
          } finally {
             setLoading(false);
          }
      }
      loadText();
  }, [book, isTxt, getSavedProgress]);

  // Handle TXT Scroll Save
  const handleTxtScroll = (e: React.UIEvent<HTMLDivElement>) => {
      if (isTxt) {
          const target = e.currentTarget;
          saveProgress({ scroll: target.scrollTop });
      }
  };

  // 3. Load EPUB
  useEffect(() => {
    if (!isEpub) return;
    setLoading(true);
    let bookObj: any = null;
    let renditionObj: any = null;
    
    // Tiny delay to ensure container is rendered
    const timer = setTimeout(async () => {
        try {
            if (!(window as any).ePub) {
                setError("EPUB Reader library not loaded. Please refresh.");
                setLoading(false);
                return;
            }

            // Prepare Data
            let inputData: ArrayBuffer | string | null = null;
            if ('file' in book && book.file) {
                const buffer = await book.file.arrayBuffer();
                inputData = buffer;
            } else if ('url' in book && book.url) {
                inputData = book.url; // ePub.js handles URLs directly usually, or we can fetch buffer
            }

            if (!inputData) throw new Error("No EPUB source.");

            // Init Book
            bookObj = (window as any).ePub(inputData);
            setEpubBook(bookObj);

            // Render
            if (epubContainerRef.current) {
                renditionObj = bookObj.renderTo(epubContainerRef.current, {
                    width: '100%',
                    height: '100%',
                    flow: 'paginated',
                    manager: 'default',
                });
                
                // Resume Progress
                const saved = getSavedProgress();
                const displayTarget = saved?.cfi || undefined;
                
                await renditionObj.display(displayTarget);
                setEpubRendition(renditionObj);
                setLoading(false);
                
                // Save progress on location change
                renditionObj.on('relocated', (location: any) => {
                    saveProgress({ cfi: location.start.cfi });
                });
            }

        } catch (e: any) {
            console.error("EPUB Init Error", e);
            setError("Failed to initialize EPUB reader. " + (e.message || ""));
            setLoading(false);
        }
    }, 100);

    return () => {
        clearTimeout(timer);
        if (bookObj) bookObj.destroy();
    };
  }, [book, isEpub, getSavedProgress, saveProgress]);


  // --- TTS Logic ---
  const handleToggleSpeech = async () => {
    if (isSpeaking && !isPaused) {
        synthRef.current.pause();
        setIsPaused(true);
    } else if (isSpeaking && isPaused) {
        synthRef.current.resume();
        setIsPaused(false);
    } else {
        shouldReadRef.current = true;
        if (isPdf) await startSpeakingPdf(currentPage);
        if (isTxt) await startSpeakingText();
    }
  };

  const handleStopSpeech = () => {
      shouldReadRef.current = false;
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      setSpeakingPage(null);
  };
  
  const startSpeakingText = async () => {
      if (!textContent || !shouldReadRef.current) return;
      synthRef.current.cancel();
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(textContent.slice(0, 10000)); // limit chunk
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.rate = rate;
      
      utterance.onend = () => handleStopSpeech();
      utterance.onerror = () => handleStopSpeech();
      
      synthRef.current.speak(utterance);
  };

  const startSpeakingPdf = async (pageVal: number) => {
       if (!pdfDoc) return;
       
       try {
           setSpeakingPage(pageVal);
           const page = await pdfDoc.getPage(pageVal);
           const content = await page.getTextContent();
           const strings = content.items.map((item: any) => item.str);
           const text = strings.join(' ').trim();
           
           if (!text) {
               // Skip empty pages
               if (pageVal < numPages && shouldReadRef.current) {
                   goToPage(pageVal + 1);
                   setTimeout(() => startSpeakingPdf(pageVal + 1), 500);
               } else {
                   handleStopSpeech();
               }
               return;
           }

           const utterance = new SpeechSynthesisUtterance(text);
           if (selectedVoice) utterance.voice = selectedVoice;
           utterance.rate = rate;

           utterance.onend = () => {
               if (shouldReadRef.current) {
                   if (pageVal < numPages) {
                       goToPage(pageVal + 1);
                       setTimeout(() => startSpeakingPdf(pageVal + 1), 200);
                   } else {
                       handleStopSpeech();
                   }
               }
           };

           utterance.onerror = (e) => {
               console.error("Utterance error", e);
               handleStopSpeech();
           };

           utteranceRef.current = utterance;
           synthRef.current.cancel(); // Clear any previous
           synthRef.current.speak(utterance);
           setIsSpeaking(true);
           setIsPaused(false);

       } catch(e) {
           console.error("PDF TTS Error", e);
           handleStopSpeech();
       }
  };

  const handlePageInView = useCallback((pageNum: number) => {
      // Don't auto-update if reading (TTS), to prevent loops
      if (!shouldReadRef.current) {
        setCurrentPage(prev => {
            if (prev !== pageNum) {
                saveProgress({ page: pageNum });
                return pageNum;
            }
            return prev;
        });
      }
  }, [saveProgress]);

  const handleRemoveBroken = () => {
      if (onDelete && 'id' in book) {
          onDelete(book as CommunityBook);
      }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-fadeIn">
      {/* Toolbar */}
      <div className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 shadow-xl shrink-0 gap-2 relative z-20">
        
        {/* Left Actions */}
        <div className="flex items-center gap-3 overflow-hidden min-w-0 mr-auto">
          {isPdf && (
            <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className={`p-2 rounded-lg transition-colors ${showSidebar ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                title="Toggle Sidebar"
            >
                <List size={20} />
            </button>
          )}

          <div className="bg-brand-600 p-2 rounded-lg shrink-0 hidden sm:block">
            {isTxt ? <AlignLeft className="h-5 w-5 text-white" /> : isEpub ? <Type className="h-5 w-5 text-white"/> : <BookOpen className="h-5 w-5 text-white" />}
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-medium truncate text-sm md:text-base max-w-[150px] md:max-w-md">
              {book.title}
            </h2>
            <p className="text-slate-400 text-xs flex items-center gap-2">
               {isPdf && <span>{loading ? 'Loading...' : `${currentPage} / ${numPages}`}</span>}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Zoom Controls */}
          {(isPdf || isEpub) && (
              <div className="hidden sm:flex items-center bg-slate-700/50 rounded-lg p-1 mr-1 border border-slate-600/50">
                <button onClick={handleZoomOut} className="p-1.5 hover:bg-slate-600 rounded text-slate-300 hover:text-white transition-colors" title="Zoom Out">
                    <ZoomOut size={16} />
                </button>
                <span className="text-xs font-mono w-10 text-center text-slate-300 select-none">{Math.round(scale * 100)}%</span>
                <button onClick={handleZoomIn} className="p-1.5 hover:bg-slate-600 rounded text-slate-300 hover:text-white transition-colors" title="Zoom In">
                    <ZoomIn size={16} />
                </button>
              </div>
          )}

          {/* TTS Controls */}
          <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg p-1 border border-slate-600/50 relative">
             <button 
                onClick={handleToggleSpeech}
                className={`p-1.5 rounded-md transition-all ${isSpeaking && !isPaused ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-slate-300 hover:text-white hover:bg-slate-600'}`}
                title={isSpeaking && !isPaused ? "Pause Read Aloud" : "Read Aloud"}
             >
                {isSpeaking && !isPaused ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
             </button>
             
             {isSpeaking && (
                 <button 
                    onClick={handleStopSpeech}
                    className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-slate-600 rounded-md transition-colors"
                    title="Stop Reading"
                 >
                    <Square size={16} fill="currentColor" />
                 </button>
             )}

             <div className="w-[1px] h-4 bg-slate-600 mx-1"></div>

             <button 
                onClick={() => setShowTTSSettings(!showTTSSettings)}
                className={`p-1.5 rounded-md transition-colors ${showTTSSettings ? 'bg-slate-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-600'}`}
                title="Voice Settings"
             >
                <Settings size={18} />
             </button>

             {/* TTS Settings Dropdown */}
             {showTTSSettings && (
                 <div className="absolute top-full right-0 mt-3 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4 text-white z-50 animate-scale-in origin-top-right">
                     <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Voice Settings</span>
                        <button onClick={() => setShowTTSSettings(false)} className="text-slate-400 hover:text-white"><X size={14} /></button>
                     </div>
                     
                     <div className="space-y-4">
                         <div className="space-y-2">
                             <label className="text-xs font-medium text-slate-300">Speaking Rate ({rate}x)</label>
                             <input 
                                type="range" 
                                min="0.5" 
                                max="2" 
                                step="0.1" 
                                value={rate}
                                onChange={(e) => setRate(parseFloat(e.target.value))}
                                className="w-full accent-brand-500 h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                             />
                             <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                                 <span>0.5x</span>
                                 <span>1.0x</span>
                                 <span>2.0x</span>
                             </div>
                         </div>

                         <div className="space-y-2">
                             <label className="text-xs font-medium text-slate-300">Voice</label>
                             <select 
                                value={selectedVoice?.name || ''}
                                onChange={(e) => {
                                    const v = voices.find(voice => voice.name === e.target.value);
                                    if(v) setSelectedVoice(v);
                                }}
                                className="w-full bg-slate-900 border border-slate-600 text-slate-200 text-xs rounded-lg p-2 focus:ring-1 focus:ring-brand-500 outline-none"
                             >
                                 {voices.map(v => (
                                     <option key={v.name} value={v.name}>
                                         {v.name.slice(0, 30)}{v.name.length > 30 ? '...' : ''} ({v.lang})
                                     </option>
                                 ))}
                             </select>
                         </div>
                     </div>
                 </div>
             )}
          </div>

          <div className="w-[1px] h-8 bg-slate-700 mx-1"></div>

          <button 
            onClick={onClose}
            className="p-2 ml-1 text-slate-400 hover:text-white hover:bg-red-500/80 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-grow flex overflow-hidden relative">
        
        {/* PDF Sidebar */}
        {isPdf && (
            <div 
                className={`bg-slate-800 border-r border-slate-700 flex-shrink-0 transition-all duration-300 ease-in-out flex flex-col overflow-hidden ${showSidebar ? 'w-64 opacity-100' : 'w-0 opacity-0'}`}
            >
                {/* Bookmarks UI could go here */}
            </div>
        )}

        {/* Reader Canvas */}
        <div 
            ref={containerRef} 
            onScroll={handleTxtScroll}
            className="flex-grow bg-slate-200 overflow-auto relative scroll-smooth flex flex-col"
        >
            {!isSupported ? (
                 <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-100">
                    <p className="text-slate-500">Format not supported for direct reading.</p>
                 </div>
            ) : loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
                    <span>Opening Book...</span>
                    {getSavedProgress() && <span className="text-xs text-brand-500">Resuming from last read...</span>}
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center animate-fade-in-up">
                    <div className="bg-red-100 p-4 rounded-full mb-4 text-red-500 shadow-sm">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Unavailable</h3>
                    <p className="max-w-md text-slate-600 mb-6">{error}</p>
                    
                    {onDelete && (
                        <button 
                            onClick={handleRemoveBroken}
                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md transition-all hover:scale-105 flex items-center gap-2"
                        >
                            <Trash2 size={18} />
                            Remove from Library
                        </button>
                    )}
                </div>
            ) : isTxt ? (
                <div className="min-h-full bg-white max-w-3xl mx-auto my-8 p-10 shadow-lg rounded-sm">
                    <pre 
                        className="whitespace-pre-wrap font-serif text-slate-800 leading-relaxed" 
                        style={{ fontSize: `${scale}rem` }}
                    >
                        {textContent}
                    </pre>
                </div>
            ) : isEpub ? (
                <div className="w-full h-full bg-white relative">
                     <div ref={epubContainerRef} className="w-full h-full"></div>
                </div>
            ) : (
                <div className="flex flex-col items-center py-8 px-4 min-h-full">
                    {viewMode === 'scroll' ? (
                        Array.from(new Array(numPages), (el, index) => (
                            <PDFPage 
                                key={`page_${index + 1}`}
                                pdf={pdfDoc}
                                pageNumber={index + 1}
                                scale={scale}
                                forceRender={numPages < 10}
                                onInView={handlePageInView}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
                            <PDFPage 
                                key={`page_${currentPage}`}
                                pdf={pdfDoc}
                                pageNumber={currentPage}
                                scale={scale}
                                forceRender={true}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
      
      {/* Footer Nav */}
      {(!loading && !error) && (
          <div className="h-1 bg-slate-800"></div>
      )}
    </div>
  );
};