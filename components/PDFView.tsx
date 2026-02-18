
import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../types';
import { saveUnitPDF, getUnitPDF, getAllPDFKeys } from '../services/dbService';
import { initDriveApi, getDriveAccessToken, searchAuzefFiles, downloadDriveFile } from '../services/driveService';

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
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * BURAYA GOOGLE CLOUD CONSOLE -> CREDENTIALS -> OAUTH CLIENT ID'YI YAPIŞTIRIN
   * Örn: "123456789-abcdef.apps.googleusercontent.com"
   */
  // Fix: Added explicit string type to CLIENT_ID to avoid TypeScript narrowing it to "" and causing 'never' type errors in the logical check below.
  const CLIENT_ID: string = ""; 

  const isClientIdMissing = !CLIENT_ID || CLIENT_ID.trim() === "" || CLIENT_ID.includes("NUMARALARI");

  useEffect(() => {
    loadUnit(selectedUnit);
    refreshPDFStatus();
    if (!isClientIdMissing) {
      initDriveApi(CLIENT_ID).catch(err => {
        console.error("GIS Başlatılamadı:", err);
      });
    }
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

  const handleDriveImport = async () => {
    if (isClientIdMissing) {
      alert("⚠️ DİKKAT: Google Drive entegrasyonu için Client ID henüz girilmemiş.\n\nLütfen Google Cloud Console'dan aldığınız anahtarı PDFView.tsx dosyasındaki CLIENT_ID alanına yapıştırın.");
      return;
    }

    setIsDriveLoading(true);
    try {
      const token = await getDriveAccessToken(CLIENT_ID);
      const searchQuery = course.name.split(' ')[0];
      const files = await searchAuzefFiles(token, searchQuery);
      setDriveFiles(files);
      setShowDriveModal(true);
    } catch (err: any) {
      console.error("Drive Hatası:", err);
      alert("Hata: " + (err.message || "Drive bağlantısı kurulamadı. Cloud Console ayarlarını (Origins ve Test Users) kontrol edin."));
    } finally {
      setIsDriveLoading(false);
    }
  };

  const selectDriveFile = async (file: any) => {
    setIsDriveLoading(true);
    try {
      const token = await getDriveAccessToken(CLIENT_ID);
      const blob = await downloadDriveFile(token, file.id);
      await saveUnitPDF(course.id, selectedUnit, blob);
      setShowDriveModal(false);
      loadUnit(selectedUnit);
      refreshPDFStatus();
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      alert("Ferman mahzene indirilemedi!");
    } finally {
      setIsDriveLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      {/* Drive Modal */}
      {showDriveModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-parshmen dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] border-4 border-altin shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
            <div className="p-8 border-b-2 border-altin/20 flex justify-between items-center bg-hunkar text-altin">
              <h3 className="text-xl font-display font-black uppercase tracking-widest">☁️ BAB-I DRIVE MAHZENİ</h3>
              <button onClick={() => setShowDriveModal(false)} className="text-2xl hover:scale-125 transition-transform">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {driveFiles.length === 0 ? (
                <div className="text-center py-20 opacity-40">
                  <span className="text-6xl block mb-4">📂</span>
                  <p className="font-serif italic">Uygun ferman bulunamadı.</p>
                </div>
              ) : (
                driveFiles.map(file => (
                  <button 
                    key={file.id}
                    onClick={() => selectDriveFile(file)}
                    className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-800 hover:bg-altin/10 border-2 border-slate-100 dark:border-slate-700 hover:border-altin rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-xl">📄</div>
                      <div className="text-left">
                        <div className="font-bold text-slate-800 dark:text-white group-hover:text-hunkar truncate max-w-[200px]">{file.name}</div>
                        <div className="text-[9px] text-slate-400 font-mono mt-1">ID: {file.id}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-altin bg-hunkar px-4 py-2 rounded-full">HIFZET →</span>
                  </button>
                ))
              )}
            </div>
            {isDriveLoading && (
              <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-hunkar border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
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
                onClick={handleDriveImport}
                disabled={isDriveLoading}
                className={`flex-1 sm:flex-none px-6 py-4 rounded-2xl font-display font-black text-[10px] shadow-lg active:scale-95 transition-all flex items-center gap-2 justify-center border-b-4 ${isClientIdMissing ? 'bg-slate-200 text-slate-400 border-slate-300' : 'bg-blue-600 text-white border-blue-800'}`}
              >
                <span>☁️</span> {isClientIdMissing ? "ID GİRİLMEMİŞ" : "DRIVE'DAN GETİR"}
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="flex-1 sm:flex-none bg-hunkar text-altin border-2 border-altin px-6 py-4 rounded-2xl font-display font-black text-[10px] shadow-lg active:scale-95 transition-all flex items-center gap-2 justify-center"
              >
                📥 CİHAZDAN YÜKLE
              </button>
            </div>
            <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          </div>

          {isClientIdMissing && (
            <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/20 border-2 border-dashed border-amber-300 rounded-[2rem] text-center">
              <p className="text-xs font-serif italic text-amber-800 dark:text-amber-200">
                <strong>Hücre-i Bilgi:</strong> Google Drive üzerinden dosya çekebilmek için <code>PDFView.tsx</code> içerisindeki <code>CLIENT_ID</code> alanına geçerli bir anahtar girmeniz gerekmektedir.
              </p>
            </div>
          )}

          {loading ? (
            <div className="aspect-[3/4] sm:aspect-video w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-[2.5rem]">
               <div className="w-12 h-12 border-4 border-hunkar border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : localPdfUrl ? (
            <div className="aspect-[3/4] sm:aspect-video w-full border-4 border-slate-50 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-800">
               <embed src={localPdfUrl} type="application/pdf" className="w-full h-full" />
            </div>
          ) : (
            <div className="py-24 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-center bg-slate-50/50 dark:bg-slate-900/50 p-8">
              <div className="text-7xl mb-8 opacity-20">📜</div>
              <h3 className="text-2xl font-display font-bold text-hunkar dark:text-altin uppercase tracking-widest">Fasıl Gayrı-Mevcut</h3>
              <p className="text-slate-500 text-sm mt-4 max-w-sm mx-auto mb-10 font-serif italic">
                Bu ünite mahzene eklenmemiş. Lütfen cihazınızdan veya Drive'dan yükleyin.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={handleDriveImport}
                  className="bg-blue-600 text-white px-10 py-4 rounded-full font-display font-black text-sm shadow-xl active:scale-95 transition-all"
                >
                  ☁️ DRIVE MAHZEnİ
                </button>
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
