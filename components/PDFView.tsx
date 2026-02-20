
import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../types';
import { saveUnitPDF, getUnitPDF, getAllPDFKeys } from '../services/dbService';
import PDFCanvasViewer from './PDFCanvasViewer';

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
  const [showReader, setShowReader] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        // PDF'i yeni sekmede açmak için blob URL oluşturuyoruz.
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

  const openPdfInReader = () => {
    if (localPdfUrl) {
      setShowReader(true);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      {/* PDF Okuyucu Modal */}
      {showReader && localPdfUrl && (
        <PDFCanvasViewer pdfUrl={localPdfUrl} onClose={() => setShowReader(false)} />
      )}

      {/* Sidebar: Unit List */}
      <div className="w-full lg:w-72 shrink-0">
        <div className="bg-hunkar p-6 rounded-[2.5rem] border-2 border-altin shadow-xl sticky top-24 rumi-border">
          <h3 className="text-altin font-display font-bold text-lg mb-4 flex items-center gap-3">
            <span>📜</span> MECLİS-İ FİHRİST
          </h3>
          <div className="grid grid-cols-4 lg:grid-cols-2 gap-2 max-h-[450px] overflow-y-auto no-scrollbar pr-1">
            {Array.from({ length: 14 }, (_, i) => i + 1).map((num) => {
              const isUploaded = uploadedKeys.includes(`${course.id}_unit_${num}`);
              const isActive = selectedUnit === num;
              return (
                <button
                  key={num}
                  onClick={() => onUnitChange(num)}
                  className={`p-3 rounded-xl font-display font-bold text-[10px] transition-all border-2 flex flex-col items-center justify-center gap-1 ${
                    isActive ? 'bg-altin text-hunkar border-white' : isUploaded ? 'bg-white/10 text-white' : 'bg-black/20 text-white/30 border-transparent opacity-60'
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

      {/* Main Area */}
      <div className="flex-1 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-1">{selectedUnit}. Fasıl</h2>
              <div className="w-12 h-1 bg-altin"></div>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="flex-1 sm:flex-none bg-hunkar text-altin border-2 border-altin px-6 py-4 rounded-2xl font-display font-black text-[10px] shadow-lg active:scale-95 transition-all flex items-center gap-2 justify-center hover:brightness-110"
              >
                📥 CİHAZDAN YÜKLE
              </button>
            </div>
            <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          </div>

          {loading ? (
            <div className="aspect-[3/4] sm:aspect-video w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-[2.5rem]">
               <div className="w-12 h-12 border-4 border-hunkar border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : localPdfUrl ? (
            <div className="py-20 border-4 border-altin/20 rounded-[3rem] text-center bg-altin/5 p-8 animate-in zoom-in-95 duration-500">
              <div className="text-7xl mb-6 float-icon">📖</div>
              <h3 className="text-2xl font-display font-bold text-hunkar dark:text-altin uppercase tracking-widest mb-4">Fasıl Mütalaaya Hazır</h3>
              <p className="text-slate-600 dark:text-orange-50/60 text-sm max-w-sm mx-auto mb-10 font-serif italic">
                {selectedUnit}. Fasıl mahzenden çıkarıldı. Okumaya başlamak için aşağıdaki butona tıklayınız.
              </p>
              <button 
                onClick={openPdfInReader}
                className="bg-hunkar text-altin px-12 py-5 rounded-full font-display font-black text-lg shadow-2xl border-2 border-altin active:scale-95 transition-all hover:brightness-110 flex items-center gap-4 mx-auto"
              >
                <span>📜</span> FASILI AÇ (OKU)
              </button>
              <p className="mt-6 text-[10px] text-slate-400 font-sans uppercase tracking-widest">
                * PDF tarayıcınızın kendi görüntüleyicisinde açılacaktır.
              </p>
            </div>
          ) : (
            <div className="py-24 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-center bg-slate-50/50 dark:bg-slate-900/50 p-8">
              <div className="text-7xl mb-8 opacity-20">📜</div>
              <h3 className="text-2xl font-display font-bold text-hunkar dark:text-altin uppercase tracking-widest">Fasıl Gayrı-Mevcut</h3>
              <p className="text-slate-500 text-sm mt-4 max-w-sm mx-auto mb-10 font-serif italic">
                Bu ünite mahzene eklenmemiş. Lütfen cihazınızdan yükleyin.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="bg-hunkar text-altin px-10 py-4 rounded-full font-display font-black text-sm shadow-xl border-2 border-altin active:scale-95 transition-all"
                >
                  📥 CİHAZDAN SEÇ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFView;
