
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
    // Blob'un PDF olarak tanındığından emin olalım
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
        <div className="p-4 bg-white border-b flex items-center justify-between">
          <h3 className="font-bold text-slate-800 truncate pr-4">{viewingPdf.name}</h3>
          <div className="flex gap-2">
             <a 
              href={viewingPdf.url} 
              target="_blank" 
              rel="noreferrer"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm"
            >
              Dışarıda Aç ↗
            </a>
            <button 
              onClick={() => {
                URL.revokeObjectURL(viewingPdf.url);
                setViewingPdf(null);
              }}
              className="bg-slate-100 px-4 py-2 rounded-lg font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="text-slate-500 font-bold hover:text-blue-600 transition-colors flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
          </button>
          <h2 className="text-3xl font-serif font-bold text-slate-900">Dijital Kütüphanem</h2>
        </div>
        
        <button 
          onClick={() => setShowUploadSection(!showUploadSection)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
        >
          {showUploadSection ? "✖ Vazgeç" : "➕ Yeni Kitap Yükle"}
        </button>
      </div>

      {showUploadSection && (
        <div className="mb-8 bg-indigo-50 border border-indigo-100 p-6 rounded-3xl animate-in zoom-in-95 duration-300 shadow-inner">
          <h3 className="text-lg font-bold text-indigo-900 mb-4">Hızlı PDF Yükleme</h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wider">İlgili Ders</label>
              <select 
                value={selectedCourseForUpload}
                onChange={(e) => setSelectedCourseForUpload(e.target.value)}
                className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
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
                className="w-full md:w-auto bg-white text-indigo-600 border border-indigo-200 px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
              >
                Bilgisayardan Dosya Seç
              </button>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border-2 border-dashed border-slate-200 text-center">
          <div className="text-6xl mb-6">📚</div>
          <h3 className="text-xl font-bold text-slate-800">Kütüphaneniz Henüz Boş</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            Yüklediğiniz kitaplar burada listelenir. "Yeni Kitap Yükle" butonuyla başlayın.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(({ id, blob }) => {
            const course = COURSES.find(c => c.id === id);
            return (
              <div 
                key={id} 
                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group relative overflow-hidden"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${course?.color || 'bg-slate-200'} text-white shadow-inner`}>
                    {course?.icon || '📖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-base leading-tight truncate">
                      {course?.name || "Bilinmeyen Ders"}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">PDF DOSYASI</span>
                      <span className="text-slate-400 text-[10px]">
                        {(blob.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex gap-2">
                  <button 
                    onClick={() => handleView(id, blob)}
                    className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <span>👁️</span> Oku
                  </button>
                  <button 
                    onClick={() => onSelectCourse(id)}
                    className="flex-1 bg-indigo-50 text-indigo-600 py-3 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all"
                  >
                    Detaylar
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, id)}
                    className="w-12 bg-rose-50 text-rose-400 flex items-center justify-center rounded-xl hover:bg-rose-500 hover:text-white transition-all group/del"
                    title="Sil"
                  >
                    <span className="group-hover/del:scale-110 transition-transform">🗑️</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-12 p-8 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
            <span className="text-2xl">🛡️</span> Güvenli ve Hızlı Erişim
          </h4>
          <p className="text-sm text-indigo-100 leading-relaxed max-w-2xl opacity-90">
            Dosyalarınız tarayıcınızın özel belleğinde saklanır. Görüntüleme sorunu yaşarsanız "Dışarıda Aç" butonunu kullanarak tarayıcınızın kendi PDF görüntüleyicisini tetikleyebilirsiniz.
          </p>
        </div>
        <div className="absolute right-[-40px] top-[-40px] opacity-10 text-[200px] select-none rotate-12">📚</div>
      </div>
    </div>
  );
};

export default LibraryView;
