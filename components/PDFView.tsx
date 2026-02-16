
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
      
      for (let i = 1; i <= Math.min(pdf.numPages, 100); i++) {
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
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Dijital Kitaplık</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className={`w-2 h-2 rounded-full ${localPdfUrl ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
               <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                 {localPdfUrl ? 'Çevrimdışı Kullanılabilir' : 'Bulut Modu / Yüklenmedi'}
               </span>
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto bg-slate-900 dark:bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <span>📥</span> {localPdfUrl ? 'Kitabı Güncelle' : 'Kitap Yükle'}
          </button>
          <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        </div>

        {localPdfUrl && (
          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Kitap içinde ara (Örn: Savaşlar)..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-indigo-500 transition-all dark:text-white"
            />
            <button 
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-sm disabled:opacity-50 shadow-lg active:scale-95 transition-all"
            >
              {isSearching ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Bul"}
            </button>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="mb-8 bg-slate-50 dark:bg-slate-950 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 max-h-64 overflow-y-auto space-y-3 shadow-inner">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Bulunan Sonuçlar ({searchResults.length})</p>
            {searchResults.map((res, i) => (
              <button 
                key={i} 
                onClick={() => jumpToPage(res.page)}
                className="w-full text-left p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 transition-all flex items-center gap-4"
              >
                <div className="bg-slate-900 dark:bg-indigo-900 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold">Sayfa {res.page}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 italic line-clamp-1">{res.text}</p>
              </button>
            ))}
          </div>
        )}

        {finalPdfUrl ? (
          <div className="aspect-[3/4] md:aspect-[16/10] w-full border-4 border-slate-50 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-slate-200 dark:bg-slate-950 shadow-2xl relative">
             <embed ref={embedRef} src={finalPdfUrl} type="application/pdf" className="w-full h-full" />
             <div className="absolute bottom-6 right-6 flex gap-3">
                <a href={localPdfUrl!} target="_blank" rel="noreferrer" className="bg-white/90 dark:bg-slate-900/90 backdrop-blur px-6 py-3 rounded-xl font-bold text-sm shadow-xl hover:bg-white transition-all dark:text-white">Tam Ekran ↗</a>
             </div>
          </div>
        ) : (
          <div className="py-16 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-900/50 p-8">
            <div className="text-7xl mb-6 grayscale opacity-30">📂</div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">Bu Dersin Kitabı Yüklenmemiş</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 max-w-sm mx-auto mb-8">
              Ders kitabını bir kez yüklersen, internetin olmasa bile istediğin zaman okuyabilirsin.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
              <a 
                href={course.pdfUrl} 
                target="_blank" 
                rel="noreferrer"
                className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/50 text-left hover:scale-[1.02] transition-transform group"
              >
                <div className="text-2xl mb-2">🌍</div>
                <div className="font-bold text-sm mb-1">Resmi Kaynaktan İndir</div>
                <div className="text-[10px] opacity-70">AUZEF portalından PDF'i aç ve cihazına kaydet.</div>
              </a>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-900 dark:bg-slate-800 text-white p-6 rounded-3xl text-left hover:scale-[1.02] transition-transform"
              >
                <div className="text-2xl mb-2">📥</div>
                <div className="font-bold text-sm mb-1">Cihazdan Yükle</div>
                <div className="text-[10px] opacity-70">İndirdiğin PDF'i seçerek çevrimdışı belleğe ekle.</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFView;
