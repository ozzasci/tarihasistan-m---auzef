
import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../types';
import { saveUnitPDF, getUnitPDF, getAllPDFKeys } from '../services/dbService';
import { 
  initDriveApi, 
  searchAuzefFiles, 
  downloadDriveFile, 
  DriveFile 
} from '../services/driveService';

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

  // Drive States
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isDriveSearching, setIsDriveSearching] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('auzef');

  const units = Array.from({ length: 14 }, (_, i) => i + 1);

  useEffect(() => {
    loadUnit(selectedUnit);
    refreshPDFStatus();
    initDriveApi().catch(err => console.error("Drive Başlatılamadı:", err));
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

  const handleDriveSearch = async () => {
    setIsDriveSearching(true);
    setDriveError(null);
    try {
      const files = await searchAuzefFiles(searchTerm);
      setDriveFiles(files);
      if (files.length === 0) setDriveError("Arşivde bu isimle bir ferman bulunamadı.");
    } catch (err: any) {
      console.error("Arama hatası:", err);
      const msg = err.result?.error?.message || err.message || "Google Drive bağlantısı kurulamadı.";
      setDriveError(msg);
    } finally {
      setIsDriveSearching(false);
    }
  };

  const handleImport = async (file: DriveFile) => {
    setIsDriveSearching(true);
    try {
      const blob = await downloadDriveFile(file.id);
      await saveUnitPDF(course.id, selectedUnit, blob);
      await loadUnit(selectedUnit);
      await refreshPDFStatus();
      setIsDriveModalOpen(false);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      setDriveError("Dosya indirilemedi: " + err.message);
    } finally {
      setIsDriveSearching(false);
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
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 sm:flex-none bg-hunkar text-altin border-2 border-altin px-6 py-3 rounded-2xl font-display font-bold text-[10px]">📥 YÜKLE</button>
              <button onClick={() => setIsDriveModalOpen(true)} className="flex-1 sm:flex-none bg-white dark:bg-slate-800 text-slate-700 dark:text-altin border-2 border-slate-200 dark:border-altin/30 px-6 py-3 rounded-2xl font-display font-bold text-[10px]">☁️ DRIVE</button>
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
              <p className="text-slate-500 text-sm mt-3 max-w-sm mx-auto mb-8 font-serif italic">Kitabı doğrudan cihazınızdan yükleyebilir veya Google Drive arşivinizden çekebilirsiniz.</p>
              <button onClick={() => setIsDriveModalOpen(true)} className="bg-hunkar text-altin px-10 py-4 rounded-full font-display font-black text-sm shadow-xl border-2 border-altin">DRIVE'DA ARA 🔍</button>
            </div>
          )}
        </div>
      </div>

      {/* Drive Modal */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] p-8 shadow-2xl flex flex-col max-h-[90vh]">
             <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                 <img src="https://www.gstatic.com/images/branding/product/2x/drive_48dp.png" className="w-8 h-8" alt="Drive" />
                 <h3 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase">Beytü'l-Hafıza</h3>
               </div>
               <button onClick={() => setIsDriveModalOpen(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full transition-colors">✕</button>
             </div>

             <div className="relative mb-6">
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleDriveSearch()}
                  placeholder="Dosya ismi yazın (Örn: Rusya Tarihi)..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-indigo-100 rounded-2xl px-12 py-4 text-xs font-serif italic outline-none focus:border-hunkar shadow-inner"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
                <button 
                  onClick={handleDriveSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-hunkar text-altin px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  ARA
                </button>
             </div>

             {driveError && (
              <div className="mb-6 bg-rose-50 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-200 dark:border-rose-900 animate-in slide-in-from-top-2">
                 <p className="text-[10px] font-black text-rose-600 uppercase mb-1">DİKKAT</p>
                 <p className="text-[10px] text-rose-500 italic">{driveError}</p>
                 {driveError.includes("origin_mismatch") && (
                   <p className="mt-2 text-[9px] font-bold text-slate-500">Çözüm: Google Console'a bu sitenin URL'sini ekleyin.</p>
                 )}
              </div>
             )}

             <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-[300px] no-scrollbar">
                {isDriveSearching ? (
                  <div className="py-20 text-center">
                    <div className="w-10 h-10 border-4 border-hunkar border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-serif italic">Arşiv taranıyor...</p>
                  </div>
                ) : driveFiles.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center">
                    <div className="text-6xl mb-4 grayscale opacity-30">📂</div>
                    <p className="text-slate-400 italic font-serif">Henüz bir sonuç yok. Arama yapın.</p>
                  </div>
                ) : (
                  driveFiles.map((file) => (
                    <div key={file.id} className="bg-slate-50 dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-altin transition-all">
                       <div className="truncate pr-4 flex items-center gap-3">
                         <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-xl">📄</div>
                         <div className="truncate">
                           <h4 className="font-bold text-slate-800 dark:text-white truncate text-sm mb-1">{file.name}</h4>
                           <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">
                             {file.size ? (parseInt(file.size) / (1024 * 1024)).toFixed(1) + " MB" : "PDF"}
                           </span>
                         </div>
                       </div>
                       <button onClick={() => handleImport(file)} className="bg-hunkar text-altin px-6 py-2.5 rounded-xl font-display font-bold text-[10px] shadow-md hover:brightness-110 active:scale-95 transition-all">HIFZET 🖋️</button>
                    </div>
                  ))
                )}
             </div>
             
             <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Oğuz Bulut Özel Versiyon v3.0</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFView;
