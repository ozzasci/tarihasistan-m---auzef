
import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../types';
import { saveUnitPDF, getUnitPDF, getAllPDFKeys } from '../services/dbService';

declare const pdfjsLib: any;

interface SearchResult {
  page: number;
  text: string;
}

interface PDFViewProps {
  course: Course;
  selectedUnit: number;
  onUnitChange: (unit: number) => void;
  onUploadSuccess?: () => void;
}

const PDFView: React.FC<PDFViewProps> = ({ course, selectedUnit, onUnitChange, onUploadSuccess }) => {
  const [localPdfUrl, setLocalPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadedKeys, setUploadedKeys] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const embedRef = useRef<HTMLEmbedElement>(null);

  const units = Array.from({ length: 14 }, (_, i) => ({
    number: i + 1,
    title: i === 0 ? "1. Fasıl (Mebde)" : `${i + 1}. Fasıl`,
  }));

  const refreshPDFStatus = async () => {
    const keys = await getAllPDFKeys();
    setUploadedKeys(keys);
  };

  useEffect(() => {
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    loadUnit(selectedUnit);
    refreshPDFStatus();
  }, [course.id, selectedUnit]);

  const loadUnit = async (unitNum: number) => {
    setLoading(true);
    setLocalPdfUrl(null);
    try {
      const blob = await getUnitPDF(course.id, unitNum);
      if (blob) {
        const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        setLocalPdfUrl(url);
      }
    } catch (error) {
      console.error("Fasıl yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      await saveUnitPDF(course.id, selectedUnit, file);
      loadUnit(selectedUnit);
      refreshPDFStatus();
      if (onUploadSuccess) onUploadSuccess();
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

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      <div className="w-full lg:w-72 shrink-0 space-y-4">
        <div className="bg-hunkar p-6 rounded-[2rem] border-2 border-altin shadow-xl">
           <h3 className="text-altin font-display font-bold text-lg mb-4 flex items-center gap-2">
             <span>📜</span> MECLİS-İ FİHRİST
           </h3>
           <div className="grid grid-cols-4 lg:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto no-scrollbar">
              {units.map((u) => {
                const isUploaded = uploadedKeys.includes(`${course.id}_unit_${u.number}`);
                return (
                  <button
                    key={u.number}
                    onClick={() => onUnitChange(u.number)}
                    className={`p-3 rounded-xl font-display font-bold text-[10px] tracking-widest transition-all border-2 flex flex-col items-center justify-center gap-1 ${
                      selectedUnit === u.number 
                        ? 'bg-altin text-hunkar border-white' 
                        : isUploaded 
                          ? 'bg-white/10 text-white border-white/20 hover:bg-white/20' 
                          : 'bg-black/20 text-white/40 border-transparent opacity-60'
                    }`}
                  >
                    <span className="text-xs">{u.number}</span>
                    <span className="opacity-60">{u.number === 1 ? 'MEBDE' : isUploaded ? 'HIFZ' : 'BOŞ'}</span>
                  </button>
                );
              })}
           </div>
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">{selectedUnit}. Fasıl (Ünite)</h2>
              <div className="flex items-center gap-2 mt-1">
                 <span className={`w-2 h-2 rounded-full ${localPdfUrl ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                 <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                   {localPdfUrl ? 'Çevrimdışı Mahzende' : 'Yüklenmemiş'}
                 </span>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto bg-hunkar text-altin border-2 border-altin px-8 py-3 rounded-2xl font-display font-bold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <span>📥</span> {localPdfUrl ? 'Faslı Güncelle' : 'Fasıl Yükle'}
            </button>
            <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          </div>

          {loading ? (
            <div className="aspect-[16/10] w-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 rounded-[2rem]">
               <div className="w-12 h-12 border-4 border-hunkar border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : localPdfUrl ? (
            <div className="aspect-[3/4] md:aspect-[16/10] w-full border-4 border-slate-50 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-slate-200 dark:bg-slate-950 shadow-2xl relative">
               <embed ref={embedRef} src={`${localPdfUrl}#page=${currentPage}`} type="application/pdf" className="w-full h-full" />
            </div>
          ) : (
            <div className="py-20 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-900/50 p-8">
              <div className="text-7xl mb-6 grayscale opacity-30">📜</div>
              <h3 className="text-xl font-display font-bold text-hunkar dark:text-altin uppercase">Başlangıç İçin Faslı Hıfzedin</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 max-w-sm mx-auto mb-8 font-serif">
                {selectedUnit}. Ünite kitabını hıfzederek internetsiz mütalaa etmeye başlayabilirsiniz.
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-hunkar text-altin px-10 py-4 rounded-full font-display font-black text-xs tracking-widest shadow-xl hover:brightness-110 transition-all border-2 border-altin"
              >
                HEMEN YÜKLE 📥
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFView;
