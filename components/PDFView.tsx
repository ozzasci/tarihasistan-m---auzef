
import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../types';
import { savePDF, getPDF } from '../services/dbService';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const embedRef = useRef<HTMLEmbedElement>(null);

  useEffect(() => {
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    const loadStoredPdf = async () => {
      setLoading(true);
      try {
        const blob = await getPDF(course.id);
        if (blob) {
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          setLocalPdfUrl(URL.createObjectURL(pdfBlob));
        }
      } catch (error) {
        console.error("PDF yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStoredPdf();
  }, [course.id]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      await savePDF(course.id, file);
      const url = URL.createObjectURL(file);
      setLocalPdfUrl(url);
      setSearchResults([]);
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
      
      for (let i = 1; i <= Math.min(pdf.numPages, 100); i++) { // Mobil için ilk 100 sayfa sınırlaması
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        
        if (pageText.toLowerCase().includes(query)) {
          const index = pageText.toLowerCase().indexOf(query);
          const start = Math.max(0, index - 40);
          const end = Math.min(pageText.length, index + query.length + 40);
          results.push({ page: i, text: `...${pageText.substring(start, end)}...` });
        }
      }
      setSearchResults(results);
    } catch (error) {
      console.error("Arama hatası:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const jumpToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    if (embedRef.current && localPdfUrl) {
      embedRef.current.src = `${localPdfUrl}#page=${pageNumber}&search="${searchQuery}"`;
    }
  };

  const finalPdfUrl = localPdfUrl ? `${localPdfUrl}#page=${currentPage}` : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-serif font-bold text-slate-900">Dijital Kitaplık</h2>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
          >
            <span>📥</span> Kitap Yükle
          </button>
          <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        </div>

        <div className="flex gap-2 mb-6">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Terim ara (Örn: Altınorda Şehirleri)..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-slate-900 transition-all"
          />
          <button 
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-sm disabled:opacity-50 shadow-lg shadow-indigo-100 active:scale-95 transition-all"
          >
            {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Bul"}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mb-8 bg-slate-50 rounded-3xl p-6 border border-slate-100 max-h-64 overflow-y-auto space-y-3 shadow-inner">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Arama Sonuçları ({searchResults.length})</p>
            {searchResults.map((res, i) => (
              <button 
                key={i} 
                onClick={() => jumpToPage(res.page)}
                className="w-full text-left p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all flex items-center gap-4"
              >
                <div className="bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold">Sayfa {res.page}</div>
                <p className="text-xs text-slate-600 italic line-clamp-1">{res.text}</p>
              </button>
            ))}
          </div>
        )}

        {finalPdfUrl ? (
          <div className="aspect-[3/4] md:aspect-[16/10] w-full border-4 border-slate-50 rounded-[2rem] overflow-hidden bg-slate-200 shadow-2xl relative">
             <embed ref={embedRef} src={finalPdfUrl} type="application/pdf" className="w-full h-full" />
             <div className="absolute bottom-6 right-6 flex gap-3">
                <a href={localPdfUrl!} target="_blank" rel="noreferrer" className="bg-white/90 backdrop-blur px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:bg-white transition-all">Tam Ekran ↗</a>
             </div>
          </div>
        ) : (
          <div className="py-24 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-center bg-slate-50/50">
            <div className="text-7xl mb-6 opacity-30">📚</div>
            <h3 className="text-xl font-bold text-slate-400">Kitap Henüz Hazır Değil</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">AUZEF PDF dosyanızı yükleyerek dijital asistanınızı etkinleştirin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFView;
