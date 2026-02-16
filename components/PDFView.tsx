
import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../types';
import { savePDF, getPDF, deletePDF } from '../services/dbService';

interface PDFViewProps {
  course: Course;
}

const PDFView: React.FC<PDFViewProps> = ({ course }) => {
  const [localPdfUrl, setLocalPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImmersive, setIsImmersive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let currentUrl: string | null = null;

    const loadStoredPdf = async () => {
      setLoading(true);
      try {
        const blob = await getPDF(course.id);
        if (blob) {
          // Blobu doğru MIME tipiyle oluşturduğumuzdan emin olalım
          const pdfBlob = new Blob([blob], { type: 'application/pdf' });
          currentUrl = URL.createObjectURL(pdfBlob);
          setLocalPdfUrl(currentUrl);
        } else {
          setLocalPdfUrl(null);
        }
      } catch (error) {
        console.error("PDF yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStoredPdf();

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [course.id]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      try {
        await savePDF(course.id, file);
        const url = URL.createObjectURL(file);
        if (localPdfUrl) URL.revokeObjectURL(localPdfUrl);
        setLocalPdfUrl(url);
      } catch (error) {
        alert("Dosya kaydedilirken bir hata oluştu.");
      }
    } else if (file) {
      alert("Lütfen geçerli bir PDF dosyası seçin.");
    }
  };

  const handleRemovePdf = async () => {
    if (window.confirm("Bu PDF dosyasını silmek istediğinize emin misiniz?")) {
      await deletePDF(course.id);
      if (localPdfUrl) {
        URL.revokeObjectURL(localPdfUrl);
        setLocalPdfUrl(null);
      }
    }
  };

  const currentPdfUrl = localPdfUrl || course.pdfUrl;
  
  // Blob URL'lerine fragment (#) eklemek bazı tarayıcılarda hataya yol açar.
  // Sadece uzak URL'lere toolbar parametresi ekliyoruz.
  const finalPdfUrl = currentPdfUrl?.startsWith('blob:') 
    ? currentPdfUrl 
    : (currentPdfUrl ? `${currentPdfUrl}#toolbar=0` : null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 animate-pulse">Kitap yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Immersive Modal View */}
      {isImmersive && currentPdfUrl && (
        <div className="fixed inset-0 z-[60] bg-slate-900 flex flex-col animate-in fade-in duration-300">
          <div className="p-4 bg-white border-b flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-xl">{course.icon}</span>
              <h3 className="font-bold text-slate-800 truncate">{course.name}</h3>
            </div>
            <div className="flex gap-2">
              <a 
                href={currentPdfUrl} 
                target="_blank" 
                rel="noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hidden md:block"
              >
                Yeni Sekmede Aç ↗
              </a>
              <button 
                onClick={() => setIsImmersive(false)}
                className="bg-slate-100 px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                Kapat ✕
              </button>
            </div>
          </div>
          <div className="flex-1 bg-slate-800 flex flex-col items-center justify-center p-0">
             <object
                data={currentPdfUrl}
                type="application/pdf"
                className="w-full h-full"
              >
                <div className="text-white text-center p-10">
                  <p className="mb-4">PDF önizlemesi bu tarayıcıda desteklenmiyor.</p>
                  <a href={currentPdfUrl} target="_blank" rel="noreferrer" className="bg-blue-500 px-6 py-3 rounded-xl font-bold">Dosyayı Doğrudan Aç</a>
                </div>
              </object>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Ders Materyali</h2>
            <p className="text-sm text-slate-500 italic">
              {localPdfUrl ? "Cihazınızdan yüklenen PDF" : "AUZEF Çevrimiçi Kitap"}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-100 active:scale-95 transition-all"
            >
              <span>📤</span> {localPdfUrl ? "Değiştir" : "Kitap Yükle"}
            </button>

            {currentPdfUrl && (
              <button
                onClick={() => setIsImmersive(true)}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 transition-all"
              >
                <span>🔍</span> Tam Ekran
              </button>
            )}
            
            {localPdfUrl && (
              <button
                onClick={handleRemovePdf}
                className="bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <span>🗑️</span> Sil
              </button>
            )}
          </div>
        </div>

        {finalPdfUrl ? (
          <div className="relative group">
            <div className="aspect-[3/4] md:aspect-video w-full border border-slate-200 rounded-xl overflow-hidden bg-slate-100 shadow-inner">
               <embed
                src={finalPdfUrl}
                type="application/pdf"
                className="w-full h-full"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none md:pointer-events-auto">
               <button 
                onClick={() => setIsImmersive(true)}
                className="bg-white text-slate-800 px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform"
              >
                <span>📖</span> Okumaya Başla
              </button>
            </div>
          </div>
        ) : (
          <div className="py-20 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center bg-slate-50">
            <div className="text-5xl mb-4">📑</div>
            <h3 className="text-lg font-bold text-slate-800">PDF Henüz Yüklenmemiş</h3>
            <p className="text-slate-500 mt-2 max-w-xs px-4">
              AUZEF kitaplarınızı buraya yükleyerek her yerden çalışabilirsiniz.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 text-blue-600 font-bold hover:underline"
            >
              Dosya Seçin →
            </button>
          </div>
        )}
        
        {localPdfUrl && (
           <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
            <span className="text-xl">💡</span>
            <p className="text-xs text-amber-800 leading-relaxed">
              PDF görüntülenmiyorsa <b>Tam Ekran</b> butonuna basabilir veya <a href={localPdfUrl} target="_blank" rel="noreferrer" className="underline font-bold">buraya tıklayarak</a> doğrudan tarayıcıda açabilirsiniz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFView;
