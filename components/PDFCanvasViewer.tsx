
import React, { useEffect, useRef, useState } from 'react';

declare const pdfjsLib: any;

interface PDFCanvasViewerProps {
  pdfUrl: string;
  onClose?: () => void;
}

const PDFCanvasViewer: React.FC<PDFCanvasViewerProps> = ({ pdfUrl, onClose }) => {
  const [pdf, setPdf] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1.5);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Worker ayarı
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      loadingTask.promise.then((loadedPdf: any) => {
        setPdf(loadedPdf);
        setNumPages(loadedPdf.numPages);
        setLoading(false);
      }).catch((err: any) => {
        console.error('PDF yükleme hatası:', err);
        setLoading(false);
      });
    }
  }, [pdfUrl]);

  useEffect(() => {
    if (pdf && canvasRef.current) {
      renderPage(currentPage);
    }
  }, [pdf, currentPage, scale]);

  const renderPage = async (pageNo: number) => {
    const page = await pdf.getPage(pageNo);
    const viewport = page.getViewport({ scale });
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    await page.render(renderContext).promise;
  };

  const changePage = (offset: number) => {
    const newPage = currentPage + offset;
    if (newPage >= 1 && newPage <= numPages) {
      setCurrentPage(newPage);
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const zoom = (factor: number) => {
    setScale(prev => Math.max(0.5, Math.min(3, prev + factor)));
  };

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-4 bg-hunkar text-altin flex justify-between items-center border-b-2 border-altin/30 shadow-xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all text-xl"
          >
            ←
          </button>
          <div className="hidden sm:block">
            <h3 className="font-display font-black uppercase tracking-widest text-sm">Vakanüvis Okuyucu</h3>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-black/40 rounded-full px-4 py-1 border border-altin/20">
            <button onClick={() => changePage(-1)} disabled={currentPage <= 1} className="p-2 disabled:opacity-30">◀</button>
            <span className="mx-2 text-xs font-bold font-mono">{currentPage} / {numPages}</span>
            <button onClick={() => changePage(1)} disabled={currentPage >= numPages} className="p-2 disabled:opacity-30">▶</button>
          </div>
          
          <div className="hidden sm:flex items-center bg-black/40 rounded-full px-2 border border-altin/20">
            <button onClick={() => zoom(-0.25)} className="p-2 text-lg">➖</button>
            <button onClick={() => zoom(0.25)} className="p-2 text-lg">➕</button>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center bg-altin text-hunkar rounded-full font-bold shadow-lg"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center bg-slate-900 no-scrollbar"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center text-altin">
            <div className="w-12 h-12 border-4 border-altin border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-display font-bold uppercase tracking-widest animate-pulse">Varak Açılıyor...</p>
          </div>
        ) : (
          <div className="relative shadow-2xl border-4 border-white/10 rounded-sm overflow-hidden bg-white">
            <canvas ref={canvasRef} className="max-w-full h-auto" />
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="sm:hidden p-4 bg-hunkar/90 backdrop-blur-md border-t border-altin/20 flex justify-around items-center">
        <button onClick={() => zoom(-0.25)} className="bg-white/10 p-3 rounded-xl text-altin">➖ Küçült</button>
        <button onClick={() => zoom(0.25)} className="bg-white/10 p-3 rounded-xl text-altin">➕ Büyüt</button>
      </div>
    </div>
  );
};

export default PDFCanvasViewer;
