
import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../types';
import { savePDF, getPDF, deletePDF } from '../services/dbService';

// PDF.js global definition for TypeScript
declare const pdfjsLib: any;

interface SearchResult {
  page: number;
  text: string;
}

interface PDFViewProps {
  course: Course;
}

const PDFView: React.FC<PDFViewProps> = ({ course }) => {
  const [localPdfUrl, setLocalPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImmersive, setIsImmersive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const embedRef = useRef<HTMLEmbedElement>(null);

  useEffect(() => {
    // Configure PDF.js worker
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    let currentUrl: string | null = null;

    const loadStoredPdf = async () => {
      setLoading(true);
      try {
        const blob = await getPDF(course.id);
        if (blob) {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          currentUrl = URL.createObjectURL(pdfBlob);
          setLocalPdfUrl(currentUrl);
        } else {
          setLocalPdfUrl(null);
        }
      } catch (error) {
        console.error("PDF yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStoredPdf();

    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [course.id]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      try {
        await savePDF(course.id, file);
        const url = URL.createObjectURL(file);
        if (localPdfUrl) URL.revokeObjectURL(localPdfUrl);
        setLocalPdfUrl(url);
        setSearchResults([]);
        setSearchQuery('');
      } catch (error) {
        alert("Dosya kaydedilirken bir hata oluştu.");
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !localPdfUrl) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      const loadingTask = pdfjsLib.getDocument(localPdfUrl);
      const pdf = await loadingTask.promise;
      const results: SearchResult[] = [];
      
      const query = searchQuery.toLowerCase();
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        
        if (pageText.toLowerCase().includes(query)) {
          // Find context around the match
          const index = pageText.toLowerCase().indexOf(query);
          const start = Math.max(0, index - 40);
          const end = Math.min(pageText.length, index + query.length + 40);
          const context = `...${pageText.substring(start, end)}...`;
          
          results.push({ page: i, text: context });
        }
      }
      setSearchResults(results);
    } catch (error) {
      console.error("Arama hatası:", error);
      alert("PDF taranırken bir hata oluştu.");
    } finally {
      setIsSearching(false);
    }
  };

  const jumpToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // standard PDF viewers support #page=N fragment
    if (localPdfUrl) {
      const newUrl = `${localPdfUrl}#page=${pageNumber}`;
      // Refreshing the embed with the page fragment
      if (embedRef.current) {
        embedRef.current.src = newUrl;
      }
    }
  };

  const currentPdfUrl = localPdfUrl || course.pdfUrl;
  const finalPdfUrl = currentPdfUrl?.startsWith('blob:') 
    ? `${currentPdfUrl}#page=${currentPage}`
    : (currentPdfUrl ? `${currentPdfUrl}#toolbar=0&page=${currentPage}` : null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500">Kitap yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Ders Materyali</h2>
            <p className="text-sm text-slate-500 italic">
              {localPdfUrl ? "Cihazınızdan yüklendi" : "AUZEF Kaynağı"}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
            >
              <span>📤</span> {localPdfUrl ? "Değiştir" : "Kitap Yükle"}
            </button>
            {currentPdfUrl && (
              <button
                onClick={() => setIsImmersive(true)}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
              >
                <span>🔍</span> Odak Modu
              </button>
            )}
          </div>
        </div>

        {/* Search Interface */}
        {localPdfUrl && (
          <div className="mb-6 space-y-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Kitap içinde ara... (Örn: Rus Devrimi)"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {isSearching ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Ara"}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 max-h-48 overflow-y-auto">
                <div className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">Arama Sonuçları ({searchResults.length})</div>
                <div className="space-y-2">
                  {searchResults.map((res, i) => (
                    <button 
                      key={i} 
                      onClick={() => jumpToPage(res.page)}
                      className="w-full text-left p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all group"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-blue-600">SAYFA {res.page}</span>
                        <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Sayfaya Git →</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 italic leading-relaxed">{res.text}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {finalPdfUrl ? (
          <div className="relative group">
            <div className="aspect-[3/4] md:aspect-video w-full border border-slate-200 rounded-xl overflow-hidden bg-slate-100">
               <embed
                ref={embedRef}
                src={finalPdfUrl}
                type="application/pdf"
                className="w-full h-full"
              />
            </div>
          </div>
        ) : (
          <div className="py-20 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center bg-slate-50">
            <div className="text-5xl mb-4">📑</div>
            <h3 className="text-lg font-bold text-slate-800">Kitap Henüz Yüklenmemiş</h3>
            <p className="text-slate-500 mt-2 max-w-xs px-4 text-sm">
              Kitabınızı yükledikten sonra içinde arama yapabilir ve önemli kısımları hızlıca bulabilirsiniz.
            </p>
          </div>
        )}
      </div>

      {isImmersive && currentPdfUrl && (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in duration-300">
          <div className="p-4 bg-white border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{course.icon}</span>
              <h3 className="font-bold text-slate-800 truncate">{course.name}</h3>
            </div>
            <button onClick={() => setIsImmersive(false)} className="bg-slate-100 px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-red-50 hover:text-red-600">
              Kapat ✕
            </button>
          </div>
          <div className="flex-1 bg-slate-800">
             <embed src={`${currentPdfUrl}#page=${currentPage}`} type="application/pdf" className="w-full h-full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFView;
