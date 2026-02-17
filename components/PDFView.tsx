
import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../types';
import { saveUnitPDF, getUnitPDF, getAllPDFKeys } from '../services/dbService';
import { 
  initDriveApi, 
  searchAuzefFiles, 
  downloadDriveFile, 
  DriveFile, 
  isDriveConfigured, 
  getStoredClientId, 
  setStoredClientId 
} from '../services/driveService';

declare const pdfjsLib: any;

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
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drive States
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [isDriveSearching, setIsDriveSearching] = useState(false);
  const [tempClientId, setTempClientId] = useState(getStoredClientId());
  const [showConfig, setShowConfig] = useState(!isDriveConfigured());
  const [configError, setConfigError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [driveSearchTerm, setDriveSearchTerm] = useState('auzef');

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
    initDriveApi().catch(() => {});
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

  const executeDriveSearch = async (term: string) => {
    setIsDriveSearching(true);
    setConfigError(null);
    try {
      await initDriveApi();
      const results = await searchAuzefFiles(term);
      setDriveFiles(results);
      setShowConfig(false);
    } catch (error: any) {
      console.error("Drive hatası:", error);
      if (error.message === "INVALID_CLIENT") {
        setConfigError("ID HATASI: Client ID yanlış veya site adresi (Origin) Google'a eklenmemiş.");
        setShowConfig(true);
      } else if (error.message === "AUTH_CANCELED") {
        setConfigError("Giriş işlemi iptal edildi veya 'Test Kullanıcısı' olarak eklenmediniz.");
        setShowConfig(true);
      } else {
        setConfigError("ERİŞİM ENGELİ: Google sizi tanımadı. Lütfen 'Test Kullanıcıları' listesine e-postanızı ekleyin.");
        setShowConfig(true);
      }
    } finally {
      setIsDriveSearching(false);
    }
  };

  const saveConfigAndSearch = async () => {
    setConfigError(null);
    const cleanedId = tempClientId.trim();
    if (!cleanedId) {
      setConfigError("Lütfen bir Client ID giriniz.");
      return;
    }
    setStoredClientId(cleanedId);
    await executeDriveSearch(driveSearchTerm);
  };

  const handleDriveImport = async () => {
    setIsDriveModalOpen(true);
    setConfigError(null);
    if (isDriveConfigured()) {
      setShowConfig(false);
      await executeDriveSearch(driveSearchTerm);
    } else {
      setShowConfig(true);
    }
  };

  const importFromDrive = async (file: DriveFile) => {
    setIsDriveSearching(true);
    try {
      const blob = await downloadDriveFile(file.id);
      await saveUnitPDF(course.id, selectedUnit, blob);
      loadUnit(selectedUnit);
      refreshPDFStatus();
      setIsDriveModalOpen(false);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      alert("Hıfzetme hatası. Dosya indirilemedi.");
    } finally {
      setIsDriveSearching(false);
    }
  };

  const formatSize = (bytes?: string) => {
    if (!bytes) return "Bilinmiyor";
    const num = parseInt(bytes);
    return (num / (1024 * 1024)).toFixed(1) + " MB";
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
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-none bg-hunkar text-altin border-2 border-altin px-6 py-3 rounded-2xl font-display font-bold text-[10px] hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg tracking-widest"
              >
                <span>📥</span> DOSYADAN YÜKLE
              </button>
              <button
                onClick={handleDriveImport}
                className="flex-1 sm:flex-none bg-white dark:bg-slate-800 text-slate-700 dark:text-altin border-2 border-slate-200 dark:border-altin/30 px-6 py-3 rounded-2xl font-display font-bold text-[10px] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-lg tracking-widest"
              >
                <img src="https://www.gstatic.com/images/branding/product/2x/drive_48dp.png" className="w-4 h-4" alt="Drive" /> DRIVE'DAN AKTAR
              </button>
            </div>
            <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          </div>

          {loading ? (
            <div className="aspect-[16/10] w-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 rounded-[2rem]">
               <div className="w-12 h-12 border-4 border-hunkar border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : localPdfUrl ? (
            <div className="aspect-[3/4] md:aspect-[16/10] w-full border-4 border-slate-50 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-slate-200 dark:bg-slate-950 shadow-2xl relative">
               <embed src={`${localPdfUrl}#page=${currentPage}`} type="application/pdf" className="w-full h-full" />
            </div>
          ) : (
            <div className="py-20 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-900/50 p-8">
              <div className="text-7xl mb-6 grayscale opacity-30">📜</div>
              <h3 className="text-xl font-display font-bold text-hunkar dark:text-altin uppercase">Başlangıç İçin Faslı Hıfzedin</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 max-w-sm mx-auto mb-8 font-serif">
                {selectedUnit}. Ünite kitabını dosya seçerek veya Google Drive hesabınızdan tarayarak hıfzedebilirsiniz.
              </p>
              <button 
                onClick={handleDriveImport}
                className="bg-hunkar text-altin px-10 py-4 rounded-full font-display font-black text-sm tracking-widest shadow-xl hover:brightness-110 transition-all border-2 border-altin flex items-center gap-3"
              >
                GOOGLE DRIVE'DA ARA 🔍
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Google Drive Import Modal */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
             <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-700">
                   <img src="https://www.gstatic.com/images/branding/product/2x/drive_48dp.png" className="w-8 h-8" alt="Drive" />
                 </div>
                 <div>
                   <h3 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-widest">Beytü'l-Hafıza</h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400 font-serif italic">Google Drive Entegrasyonu</p>
                 </div>
               </div>
               <button onClick={() => setIsDriveModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">✕</button>
             </div>

             {showConfig ? (
               <div className="flex-1 flex flex-col items-center justify-start text-center p-2 space-y-6 overflow-y-auto no-scrollbar">
                 <div className="text-5xl mt-4">🔐</div>
                 {!showGuide ? (
                   <>
                     <div>
                       <h4 className="font-display font-bold text-slate-800 dark:text-white text-lg">Erişim Yetkisi Bekleniyor</h4>
                       <p className="text-sm text-slate-500 dark:text-slate-400 font-serif mt-2 max-w-sm">
                         Google doğrulama hatası alıyorsanız kendinizi <b>'Test Kullanıcısı'</b> olarak eklemeniz şarttır.
                       </p>
                       <button onClick={() => setShowGuide(true)} className="text-[10px] text-indigo-500 underline uppercase font-black tracking-widest mt-4 inline-block">ÇÖZÜM REHBERİ (OKUYUN)</button>
                     </div>
                     <div className="w-full max-w-sm space-y-3">
                       <input 
                        type="text" 
                        value={tempClientId}
                        onChange={(e) => setTempClientId(e.target.value)}
                        placeholder="OAuth 2.0 Client ID yapıştırın..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-xs font-mono outline-none focus:border-indigo-500 transition-all dark:text-white shadow-inner"
                       />
                       {configError && (
                        <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 p-4 rounded-2xl text-[10px] font-bold text-left border border-rose-200 space-y-3 shadow-lg">
                           <p className="flex items-center gap-2"><span>⚠️</span> {configError}</p>
                           <div className="bg-white/50 p-3 rounded-xl space-y-2">
                             <p className="text-rose-700 font-black uppercase text-[9px]">KESİN ÇÖZÜM:</p>
                             <p className="font-normal text-[10px]">1. Google Cloud'da <b>'OAuth Consent Screen'</b>e gidin.</p>
                             <p className="font-normal text-[10px]">2. <b>'Test Users'</b> kısmına kendi mailinizi ekleyin.</p>
                             <p className="font-normal text-[10px]">3. Sayfayı yenileyip tekrar deneyin.</p>
                           </div>
                        </div>
                       )}
                       <button onClick={saveConfigAndSearch} disabled={isDriveSearching} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-display font-black text-[10px] tracking-widest shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                         {isDriveSearching && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                         BİLGİLERİ GÜNCELLE VE BAĞLAN →
                       </button>
                     </div>
                   </>
                 ) : (
                   <div className="w-full text-left space-y-6 animate-in slide-in-from-right-4">
                      <div className="bg-indigo-50 dark:bg-slate-800 p-6 rounded-[2rem] border border-indigo-100 dark:border-slate-700">
                        <h5 className="font-display font-black text-indigo-700 dark:text-indigo-400 text-xs uppercase mb-4">"Google Doğrulamadı" Hatası Çözümü:</h5>
                        <ul className="text-xs space-y-4 font-serif italic text-slate-600 dark:text-slate-300">
                          <li className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl border border-amber-200">
                             <b>KRİTİK ADIM:</b> Google Console'da <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" className="text-indigo-600 underline font-bold">BU SAYFAYA GİDİN</a> ve sayfanın en altındaki <b>"Test Users"</b> kısmına kendi e-postanızı ekleyin.
                          </li>
                          <li><b>Adres Kaydı:</b> "Authorized JavaScript origins" kısmına aşağıdaki adresi birebir ekleyin:</li>
                          <li className="bg-white dark:bg-black/20 p-4 rounded-xl border-2 border-indigo-200 dark:border-indigo-900 not-italic space-y-3">
                            <div className="flex gap-2">
                              <code className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg text-indigo-600 font-bold flex-1 break-all text-[10px]">{window.location.origin}</code>
                              <button onClick={() => { navigator.clipboard.writeText(window.location.origin); alert("Adres kopyalandı!"); }} className="bg-indigo-600 text-white px-3 rounded-lg text-[9px] font-bold">KOPYALA</button>
                            </div>
                          </li>
                        </ul>
                        <button onClick={() => setShowGuide(false)} className="mt-6 w-full py-3 bg-white dark:bg-slate-700 text-indigo-600 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-slate-600">← Ayarlara Dön</button>
                      </div>
                   </div>
                 )}
               </div>
             ) : (
               <>
                 <div className="px-1 mb-6">
                    <div className="relative group">
                      <input 
                        type="text"
                        value={driveSearchTerm}
                        onChange={(e) => setDriveSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && executeDriveSearch(driveSearchTerm)}
                        placeholder="Drive'da dosya adı ara... (Örn: tarih, auzef, ünite)"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-700 rounded-2xl px-12 py-4 text-xs font-serif italic outline-none focus:border-indigo-500 transition-all dark:text-white"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
                      <button 
                        onClick={() => executeDriveSearch(driveSearchTerm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"
                      >
                        ARA
                      </button>
                    </div>
                 </div>

                 <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar min-h-[300px]">
                    {isDriveSearching ? (
                      <div className="py-20 text-center">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500 font-serif italic">Drive mahzeni taranıyor...</p>
                      </div>
                    ) : driveFiles.length === 0 ? (
                      <div className="py-20 text-center flex flex-col items-center">
                        <span className="text-5xl mb-4 grayscale">🔎</span>
                        <p className="text-slate-500 font-serif italic mb-2">"{driveSearchTerm}" araması için sonuç bulunamadı.</p>
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                          {['auzef', 'tarih', 'ünite', '3. sınıf'].map(t => (
                            <button 
                              key={t}
                              onClick={() => { setDriveSearchTerm(t); executeDriveSearch(t); }}
                              className="bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-[10px] font-bold border border-indigo-100 dark:border-indigo-900"
                            >
                              "{t}" diye ara
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      driveFiles.map((file, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-indigo-300 transition-all">
                           <div className="flex-1 min-w-0 pr-4 flex items-center gap-3">
                             <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-xl shrink-0">📄</div>
                             <div className="truncate">
                               <h4 className="font-bold text-slate-800 dark:text-white truncate text-sm mb-1">{file.name}</h4>
                               <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{formatSize(file.size)}</span>
                                  <span className="text-[9px] text-slate-400">• {new Date(file.modifiedTime).toLocaleDateString('tr-TR')}</span>
                               </div>
                             </div>
                           </div>
                           <button onClick={() => importFromDrive(file)} className="bg-hunkar text-altin px-6 py-2.5 rounded-xl font-display font-bold text-[10px] tracking-widest shadow-md hover:brightness-125 transition-all whitespace-nowrap">HIFZET 🖋️</button>
                        </div>
                      ))
                    )}
                 </div>
                 <div className="mt-4 text-center">
                    <button onClick={() => setShowConfig(true)} className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-500">⚙️ Yapılandırmayı Güncelle</button>
                 </div>
               </>
             )}
             <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] text-slate-400 font-serif italic">Verileriniz IndexedDB mahzeninde güvenle saklanır.</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFView;
