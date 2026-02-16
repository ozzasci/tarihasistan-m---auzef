
import React, { useState, useEffect, useRef } from 'react';
import { getAllPDFs, deletePDF, savePDF } from '../services/dbService';
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

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Bu kitabı kütüphanenizden silmek istediğinize emin misiniz?")) {
      await deletePDF(id);
      fetchLibrary();
    }
  };

  const handleView = (id: string, blob: Blob) => {
    const course = COURSES.find(c => c.id === id);
    const name = course ? course.name : "Ders Kitabı";
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    const url = URL.createObjectURL(pdfBlob);
    setViewingPdf({ url, name });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      try {
        await savePDF(selectedCourseForUpload, file);
        setShowUploadSection(false);
        fetchLibrary();
      } catch (error) {
        alert("Dosya kaydedilirken bir hata oluştu.");
      }
    } else if (file) {
      alert("Lütfen geçerli bir PDF dosyası seçin.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500">Kütüphane taranıyor...</p>
      </div>
    );
  }

  if (viewingPdf) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-in fade-in duration-300">
        <div className="p-4 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-white truncate pr-4">{viewingPdf.name}</h3>
          <div className="flex gap-2">
             <a 
              href={viewingPdf.url} 
              target="_blank" 
              rel="noreferrer"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg"
            >
              Tam Ekran ↗
            </a>
            <button 
              onClick={() => {
                URL.revokeObjectURL(viewingPdf.url);
                setViewingPdf(null);
              }}
              className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              Kapat ✕
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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="text-slate-500 dark:text-slate-400 font-bold hover:text-indigo-600 transition-colors flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Geri
          </button>
          <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Dijital Kütüphanem</h2>
        </div>
        
        <button 
          onClick={() => setShowUploadSection(!showUploadSection)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all"
        >
          {showUploadSection ? "✕ Vazgeç" : "➕ Yeni Kitap Yükle"}
        </button>
      </div>

      {showUploadSection && (
        <div className="mb-8 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 p-6 rounded-3xl animate-in zoom-in-95 duration-300 shadow-inner">
          <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-300 mb-4">Kitap Seçimi</h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wider">Dosyayı Hangi Derse Ekliyorsun?</label>
              <select 
                value={selectedCourseForUpload}
                onChange={(e) => setSelectedCourseForUpload(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm dark:text-white"
              >
                {COURSES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-auto">
              <input 
                type="file" 
                accept=".pdf" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <button 
                onClick={handleUploadClick}
                className="w-full md:w-auto bg-slate-900 dark:bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-lg"
              >
                📁 Dosya Seç ve Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-16 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
          <div className="text-6xl mb-6 grayscale">📚</div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Kütüphanen Boş</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto mb-6">
            AUZEF ders kitaplarını buraya yükleyerek internetsiz ortamda çalışmaya başlayabilirsin.
          </p>
          <button 
            onClick={() => setShowUploadSection(true)}
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            İlk Kitabımı Nasıl Yüklerim?
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(({ id, blob }) => {
            const course = COURSES.find(c => c.id === id);
            return (
              <div 
                key={id} 
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${course?.color || 'bg-slate-200'} text-white shadow-lg`}>
                    {course?.icon || '📖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 dark:text-white text-base leading-tight truncate">
                      {course?.name || "Bilinmeyen Ders"}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">OFFLINE</span>
                      <span className="text-slate-400 text-[10px]">
                        {(blob.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-2">
                  <button 
                    onClick={() => handleView(id, blob)}
                    className="flex-1 bg-slate-900 dark:bg-slate-800 text-white py-3 rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <span>👁️</span> Oku
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, id)}
                    className="w-12 bg-rose-50 dark:bg-rose-950/20 text-rose-400 flex items-center justify-center rounded-xl hover:bg-rose-500 hover:text-white transition-all group/del shadow-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Tutorial Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-indigo-900 dark:bg-slate-800 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
          <h4 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
            <span>💡</span> Nasıl Kitap Yüklenir?
          </h4>
          <ol className="text-sm space-y-4 text-indigo-100 dark:text-slate-300 list-decimal pl-4 opacity-90">
            <li>Dersin içine girin veya yukarıdaki "+" butonuna basın.</li>
            <li>"Resmi Kaynaktan İndir" diyerek AUZEF portalına gidin.</li>
            <li>Açılan PDF dosyasını sağ tıklayıp "Farklı Kaydet" diyerek cihazınıza indirin.</li>
            <li>Ardından "Cihazdan Yükle" butonuyla indirdiğiniz bu dosyayı seçin.</li>
          </ol>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-[140px] rotate-12">📱</div>
        </div>

        <div className="p-8 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-[2.5rem] text-amber-900 dark:text-amber-200">
           <h4 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
            <span>💾</span> Veri Saklama Bilgisi
          </h4>
          <p className="text-sm leading-relaxed opacity-80">
            Kitaplar tarayıcınızın <b>IndexedDB</b> adı verilen özel alanında saklanır. Uygulama hiçbir dosyanızı sunucuya göndermez. Tarayıcı önbelleğini (Site Verilerini) tamamen temizlemediğiniz sürece kitaplar burada güvenle kalacaktır.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LibraryView;
