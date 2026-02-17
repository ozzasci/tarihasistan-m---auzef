
import React, { useState, useEffect, useRef } from 'react';
import { getAllPDFs, deleteUnitPDF, saveUnitPDF } from '../services/dbService';
import { COURSES } from '../constants';

interface LibraryViewProps {
  onSelectCourse: (courseId: string) => void;
  onBack: () => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ onSelectCourse, onBack }) => {
  const [items, setItems] = useState<{id: string, blob: Blob}[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingPdf, setViewingPdf] = useState<{url: string, name: string} | null>(null);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [selectedCourseForUpload, setSelectedCourseForUpload] = useState<string>(COURSES[0].id);
  const [selectedUnitForUpload, setSelectedUnitForUpload] = useState<number>(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const data = await getAllPDFs();
      setItems(data);
    } catch (error) {
      console.error("Kütüphane yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const resolveCourseInfo = (id: string) => {
    // Yeni format: courseId_unit_number
    if (id.includes('_unit_')) {
      const [courseId, , unitStr] = id.split('_');
      const course = COURSES.find(c => c.id === courseId);
      return {
        course,
        displayName: course ? `${course.name} - ${unitStr}. Fasıl` : `Meçhul Ders (Fasıl ${unitStr})`,
        unit: parseInt(unitStr),
        isUnit: true,
        actualCourseId: courseId
      };
    }
    // Eski/Ana format
    const course = COURSES.find(c => c.id === id);
    return {
      course,
      displayName: course ? course.name : "Meçhul Ferman",
      unit: null,
      isUnit: false,
      actualCourseId: id
    };
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const info = resolveCourseInfo(id);
    if (window.confirm(`${info.displayName} kaydını kütüphanenizden silmek istediğinize emin misiniz?`)) {
      if (info.isUnit && info.unit) {
        await deleteUnitPDF(info.actualCourseId, info.unit);
      } else {
        // Eski metodla uyumluluk için dbService'de deletePDF zaten var
        const { deletePDF } = await import('../services/dbService');
        await deletePDF(id);
      }
      fetchLibrary();
    }
  };

  const handleView = (id: string, blob: Blob) => {
    const info = resolveCourseInfo(id);
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    const url = URL.createObjectURL(pdfBlob);
    setViewingPdf({ url, name: info.displayName });
  };

  const handleFullScreen = (blob: Blob) => {
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      try {
        await saveUnitPDF(selectedCourseForUpload, selectedUnitForUpload, file);
        setShowUploadSection(false);
        fetchLibrary();
      } catch (error) {
        alert("Ferman kaydedilirken bir hata oluştu.");
      }
    } else if (file) {
      alert("Lütfen geçerli bir PDF dosyası seçin.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-altin border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-hunkar dark:text-altin font-display tracking-widest">ARŞİV TARANIYOR...</p>
      </div>
    );
  }

  if (viewingPdf) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300">
        <div className="p-4 bg-hunkar border-b-4 border-altin flex items-center justify-between text-white">
          <h3 className="font-display font-bold truncate pr-4 text-sm sm:text-base uppercase tracking-widest">{viewingPdf.name}</h3>
          <div className="flex gap-2">
             <a 
              href={viewingPdf.url} 
              target="_blank" 
              rel="noreferrer"
              className="bg-altin text-hunkar px-4 py-2 rounded-full font-display font-bold text-[10px] shadow-lg hover:brightness-110 hidden sm:block"
            >
              TAM EKRAN ↗
            </a>
            <button 
              onClick={() => {
                URL.revokeObjectURL(viewingPdf.url);
                setViewingPdf(null);
              }}
              className="bg-white/10 px-4 py-2 rounded-full font-display font-bold text-[10px] text-white hover:bg-white/20 transition-colors"
            >
              KAPAT ✕
            </button>
          </div>
        </div>
        <div className="flex-1 bg-slate-800">
           <embed src={viewingPdf.url} type="application/pdf" className="w-full h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto px-4 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="text-hunkar dark:text-altin font-display font-bold hover:opacity-70 transition-colors flex items-center gap-2 group p-2"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Geri
          </button>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-hunkar dark:text-altin tracking-widest uppercase">Beytü'l-Hikme</h2>
        </div>
        
        <button 
          onClick={() => setShowUploadSection(!showUploadSection)}
          className="bg-hunkar text-altin border-2 border-altin px-8 py-4 rounded-full font-display font-bold flex items-center justify-center gap-3 shadow-2xl hover:brightness-110 active:scale-95 transition-all text-sm tracking-widest"
        >
          {showUploadSection ? "✕ VAZGEÇ" : "➕ YENİ FASIL EKLE"}
        </button>
      </div>

      {showUploadSection && (
        <div className="mb-10 bg-white/40 dark:bg-black/20 border-2 border-altin/30 p-8 rounded-[3rem] animate-in zoom-in-95 duration-300 shadow-inner backdrop-blur-sm">
          <h3 className="text-xl font-display font-bold text-hunkar dark:text-altin mb-6 tracking-wide">Ferman (PDF) Kayıt Meclisi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="w-full">
              <label className="block text-[10px] font-display font-black text-hunkar dark:text-altin/60 mb-2 uppercase tracking-[0.3em]">Hangi Ders?</label>
              <select 
                value={selectedCourseForUpload}
                onChange={(e) => setSelectedCourseForUpload(e.target.value)}
                className="w-full bg-parshmen dark:bg-slate-900 border-2 border-altin/20 rounded-2xl px-5 py-4 text-sm font-serif italic outline-none shadow-sm dark:text-white"
              >
                {COURSES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <label className="block text-[10px] font-display font-black text-hunkar dark:text-altin/60 mb-2 uppercase tracking-[0.3em]">Hangi Fasıl (Ünite)?</label>
              <select 
                value={selectedUnitForUpload}
                onChange={(e) => setSelectedUnitForUpload(parseInt(e.target.value))}
                className="w-full bg-parshmen dark:bg-slate-900 border-2 border-altin/20 rounded-2xl px-5 py-4 text-sm font-serif italic outline-none shadow-sm dark:text-white"
              >
                {Array.from({ length: 14 }, (_, i) => i + 1).map(u => (
                  <option key={u} value={u}>{u}. Fasıl</option>
                ))}
              </select>
            </div>
          </div>
          <div className="w-full">
            <input 
              type="file" 
              accept=".pdf" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
            <button 
              onClick={handleUploadClick}
              className="w-full bg-hunkar text-altin px-10 py-5 rounded-2xl font-display font-black text-xs tracking-[0.2em] hover:brightness-110 transition-all shadow-xl border-2 border-altin"
            >
              📁 FERMANI SEÇ VE MAHZENE EKLE
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white/60 dark:bg-black/20 p-20 rounded-[4rem] border-4 border-dashed border-altin/20 text-center backdrop-blur-sm">
          <div className="text-7xl mb-6 float-icon opacity-50">📚</div>
          <h3 className="text-2xl font-display font-bold text-hunkar dark:text-altin uppercase tracking-widest">Kütüphaneniz Henüz Boş</h3>
          <p className="text-slate-600 dark:text-orange-100/60 mt-4 max-w-md mx-auto mb-10 font-serif italic text-lg leading-relaxed">
            Ünite ünite PDF'lerinizi buraya hıfzederek internetsiz ortamda mütalaa etmeye başlayabilirsiniz.
          </p>
          <button 
            onClick={() => setShowUploadSection(true)}
            className="text-hunkar dark:text-altin font-display font-bold hover:underline tracking-widest text-sm"
          >
            İLK FASLI NASIL YÜKLERİM?
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map(({ id, blob }) => {
            const info = resolveCourseInfo(id);
            const fileSizeMB = (blob.size / (1024 * 1024)).toFixed(1);
            return (
              <div 
                key={id} 
                className="bg-white/80 dark:bg-black/30 p-8 rounded-[3rem] border-t-4 border-altin shadow-xl hover:shadow-2xl hover:translate-y-[-6px] transition-all group relative overflow-hidden rumi-border"
              >
                <div className="absolute top-0 right-0 w-24 h-24 opacity-5 pointer-events-none">
                  <svg viewBox="0 0 100 100" fill="currentColor" className="text-hunkar dark:text-altin">
                    <path d="M50 0C50 0 40 20 20 20C20 20 0 30 0 50C0 70 20 80 20 80C20 80 40 100 50 100C50 100 60 80 80 80C80 80 100 70 100 50C100 30 80 20 80 20C80 20 60 0 50 0Z" />
                  </svg>
                </div>
                
                <div className="flex items-start gap-5">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shrink-0 bg-hunkar text-altin border-2 border-altin shadow-xl group-hover:scale-110 transition-transform`}>
                    {info.course?.icon || '📖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-hunkar dark:text-altin text-lg leading-tight tracking-wide mb-1">
                      {info.course?.name || "Bilinmeyen Ders"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                       <span className="bg-enderun text-white text-[8px] px-2 py-0.5 rounded-full font-display font-bold uppercase tracking-widest">
                         {info.isUnit ? `${info.unit}. FASIL` : 'ANA KİTAP'}
                       </span>
                       <span className="text-hunkar/40 dark:text-altin/40 font-serif italic text-[10px] font-bold">
                         {fileSizeMB} MB
                       </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleView(id, blob)}
                    className="bg-hunkar text-altin py-3.5 rounded-2xl text-[10px] font-display font-black uppercase tracking-widest hover:brightness-125 transition-all flex items-center justify-center gap-2 border border-altin shadow-lg"
                  >
                    <span>👁️</span> OKU
                  </button>
                  <button 
                    onClick={() => handleFullScreen(blob)}
                    className="bg-white dark:bg-black/40 text-hunkar dark:text-altin py-3.5 rounded-2xl text-[10px] font-display font-black uppercase tracking-widest hover:bg-parshmen transition-all flex items-center justify-center gap-2 border-2 border-altin/30 shadow-md"
                  >
                    <span>🔲</span> DIŞA AKTAR
                  </button>
                </div>
                
                <button 
                  onClick={(e) => handleDelete(e, id)}
                  className="mt-3 w-full bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 py-2.5 rounded-xl text-[9px] font-display font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-inner border border-transparent hover:border-rose-300"
                >
                  🗑️ MAHZENDEN ÇIKAR
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="p-10 bg-hunkar text-altin rounded-[3rem] shadow-2xl relative overflow-hidden border-2 border-altin/50">
          <h4 className="text-2xl font-display font-bold mb-6 flex items-center gap-4 uppercase tracking-widest">
            <span>🖋️</span> Mahzen Rehberi
          </h4>
          <ol className="text-base space-y-5 font-serif italic text-orange-50/80 list-decimal pl-6 opacity-90">
            <li>Derslerinizi ünite ünite (fasıl fasıl) hıfzederek mahzene ekleyebilirsiniz.</li>
            <li>Hıfzedilen her fasıl, o derse girdiğinizde otomatik olarak mütalaa modunda açılır.</li>
            <li>Tam ekran modu, fermanı harici bir sekmede daha geniş okumanızı sağlar.</li>
            <li>Mahzeniniz tamamen çevrimdışıdır, internet olmadan da erişebilirsiniz.</li>
          </ol>
          <div className="absolute right-[-30px] bottom-[-30px] opacity-10 text-[180px] rotate-12 pointer-events-none">📜</div>
        </div>

        <div className="p-10 bg-white/40 dark:bg-black/20 border-2 border-altin/30 rounded-[3rem] text-hunkar dark:text-altin backdrop-blur-sm">
           <h4 className="text-2xl font-display font-bold mb-6 flex items-center gap-4 uppercase tracking-widest">
            <span>🏛️</span> Emanet-i İlim
          </h4>
          <p className="text-base leading-relaxed font-serif italic opacity-80 mb-6">
            Kütüphanenizdeki fermanlar tarayıcınızın <b>IndexedDB</b> mahzeninde size özel saklanır. Hiçbir fermanınız sunuculara gönderilmez, akademik mahremiyetiniz esastır.
          </p>
          <div className="bg-hunkar/5 dark:bg-altin/5 p-4 rounded-2xl border border-altin/20">
            <p className="text-[10px] font-display font-black uppercase tracking-widest opacity-60">Dikkat: Tarayıcı önbelleğinin tamamen sıfırlanması mahzendeki fermanları da silebilir.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryView;
