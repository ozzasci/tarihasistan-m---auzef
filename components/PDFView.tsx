
import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../types';
import { saveUnitPDF, getUnitPDF, getAllPDFKeys } from '../services/dbService';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const units = Array.from({ length: 14 }, (_, i) => i + 1);

  useEffect(() => {
    loadUnit(selectedUnit);
    refreshPDFStatus();
  }, [course.id, selectedUnit]);

  const refreshPDFStatus = async () => {
    const keys = await getAllPDFKeys();
    setUploadedKeys(keys);
  };

  const loadUnit = async (unitNum: number) => {
    setLoading(true);
    if (localPdfUrl) URL.revokeObjectURL(localPdfUrl);
    setLocalPdfUrl(null);
    try {
      const blob = await getUnitPDF(course.id, unitNum);
      if (blob) {
        const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        setLocalPdfUrl(url);
      }
    } catch (error) {
      console.error("Fasıl yükleme hatası:", error);
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

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      {/* Sol Menü: Ünite Listesi */}
      <div className="w-full lg:w-72 shrink-0">
        <div className="bg-hunkar p-6 rounded-[2rem] border-2 border-altin shadow-xl sticky top-24">
          <h3 className="text-altin font-display font-bold text-lg mb-4 flex items-center gap-2">
            <span>📜</span> MECLİS-İ FİHRİST
          </h3>
          <div className="grid grid-cols-4 lg:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto no-scrollbar">
            {units.map((num) => {
              const isUploaded = uploadedKeys.includes(`${course.id}_unit_${num}`);
              const isActive = selectedUnit === num;
              return (
                <button
                  key={num}
                  onClick={() => onUnitChange(num)}
                  className={`p-3 rounded-xl font-display font-bold text-[10px] transition-all border-2 flex flex-col items-center justify-center gap-1 ${
                    isActive ? 'bg-altin text-hunkar border-white' : isUploaded ? 'bg-white/10 text-white' : 'bg-black/20 text-white/40 border-transparent opacity-60'
                  }`}
                >
                  <span className="text-xs">{num}</span>
                  <span className="opacity-60 uppercase">{isUploaded ? 'HIFZ' : 'BOŞ'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ana Alan: PDF Görüntüleyici */}
      <div className="flex-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">{selectedUnit}. Fasıl</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="w-full sm:w-auto bg-hunkar text-altin border-2 border-altin px-10 py-4 rounded-2xl font-display font-black text-[12px] shadow-lg active:scale-95 transition-all"
              >
                📥 CİHAZDAN YÜKLE
              </button>
            </div>
            <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          </div>

          {loading ? (
            <div className="aspect-video w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-[2rem]">
               <div className="w-12 h-12 border-4 border-hunkar border-t-transparent rounded-full animate-spin mb-4"></div>
               <p className="text-xs font-serif italic text-slate-400">Ferman açılıyor...</p>
            </div>
          ) : localPdfUrl ? (
            <div className="aspect-[3/4] md:aspect-video w-full border-4 border-slate-50 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
               <embed src={localPdfUrl} type="application/pdf" className="w-full h-full" />
            </div>
          ) : (
            <div className="py-20 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-center bg-slate-50/50 dark:bg-slate-900/50 p-8">
              <div className="text-7xl mb-6 opacity-30">📜</div>
              <h3 className="text-xl font-display font-bold text-hunkar dark:text-altin uppercase">Üniteyi Hıfzedin</h3>
              <p className="text-slate-500 text-sm mt-3 max-w-sm mx-auto mb-8 font-serif italic">
                Bu fasıl henüz mahzene eklenmemiş. Lütfen PDF dosyasını cihazınızdan seçerek sisteme dahil ediniz.
              </p>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="bg-hunkar text-altin px-10 py-4 rounded-full font-display font-black text-sm shadow-xl border-2 border-altin animate-bounce-subtle"
              >
                DOSYA SEÇ 🔍
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFView;
