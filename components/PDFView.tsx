
import React, { useState, useEffect, useRef } from 'react';
import { Course } from '../types';
import { saveUnitPDF, getUnitPDF, getAllPDFKeys } from '../services/dbService';
import { initGmailApi, searchAuzefPdfs, downloadAttachment, GmailAttachment } from '../services/gmailService';

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
  const embedRef = useRef<HTMLEmbedElement>(null);

  // Gmail States
  const [isGmailModalOpen, setIsGmailModalOpen] = useState(false);
  const [gmailAttachments, setGmailAttachments] = useState<GmailAttachment[]>([]);
  const [isGmailSearching, setIsGmailSearching] = useState(false);

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
    initGmailApi().catch(console.error);
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

  const handleGmailImport = async () => {
    setIsGmailModalOpen(true);
    setIsGmailSearching(true);
    try {
      const results = await searchAuzefPdfs();
      setGmailAttachments(results);
    } catch (error) {
      console.error("Gmail tarama hatası:", error);
      alert("Gmail erişimi sağlanamadı veya iptal edildi.");
      setIsGmailModalOpen(false);
    } finally {
      setIsGmailSearching(false);
    }
  };

  const importFromGmail = async (attachment: GmailAttachment) => {
    setIsGmailSearching(true);
    try {
      const blob = await downloadAttachment(attachment.messageId, attachment.id);
      await saveUnitPDF(course.id, selectedUnit, blob);
      loadUnit(selectedUnit);
      refreshPDFStatus();
      setIsGmailModalOpen(false);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      alert("Hıfzetme işlemi başarısız.");
    } finally {
      setIsGmailSearching(false);
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
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-none bg-hunkar text-altin border-2 border-altin px-6 py-3 rounded-2xl font-display font-bold text-[10px] hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg tracking-widest"
              >
                <span>📥</span> DOSYADAN YÜKLE
              </button>
              <button
                onClick={handleGmailImport}
                className="flex-1 sm:flex-none bg-white dark:bg-slate-800 text-slate-700 dark:text-altin border-2 border-slate-200 dark:border-altin/30 px-6 py-3 rounded-2xl font-display font-bold text-[10px] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-lg tracking-widest"
              >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="G" /> GMAIL'DEN AKTAR
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
               <embed ref={embedRef} src={`${localPdfUrl}#page=${currentPage}`} type="application/pdf" className="w-full h-full" />
            </div>
          ) : (
            <div className="py-20 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-slate-900/50 p-8">
              <div className="text-7xl mb-6 grayscale opacity-30">📜</div>
              <h3 className="text-xl font-display font-bold text-hunkar dark:text-altin uppercase">Başlangıç İçin Faslı Hıfzedin</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 max-w-sm mx-auto mb-8 font-serif">
                {selectedUnit}. Ünite kitabını dosya seçerek veya Gmail kutunuzdan tarayarak hıfzedebilirsiniz.
              </p>
              <button 
                onClick={handleGmailImport}
                className="bg-hunkar text-altin px-10 py-4 rounded-full font-display font-black text-xs tracking-widest shadow-xl hover:brightness-110 transition-all border-2 border-altin flex items-center gap-3"
              >
                GMAIL İLE ARA 🔍
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Gmail Import Modal */}
      {isGmailModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[80vh]">
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                   <img src="https://www.gstatic.com/images/branding/product/2x/gmail_48dp.png" className="w-8 h-8" alt="Gmail" />
                 </div>
                 <div>
                   <h3 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase tracking-widest">Emanet-i Posta</h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400 font-serif italic">AUZEF temalı PDF ekleri taranıyor...</p>
                 </div>
               </div>
               <button onClick={() => setIsGmailModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">✕</button>
             </div>

             <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
                {isGmailSearching ? (
                  <div className="py-20 text-center">
                    <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-serif italic">Mektuplar inceleniyor...</p>
                  </div>
                ) : gmailAttachments.length === 0 ? (
                  <div className="py-20 text-center opacity-40 italic font-serif">
                    Henüz "AUZEF" temalı PDF eki içeren bir e-posta bulunamadı.
                  </div>
                ) : (
                  gmailAttachments.map((att, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-rose-300 transition-all">
                       <div className="flex-1 min-w-0 pr-4">
                         <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">{att.date}</div>
                         <h4 className="font-bold text-slate-800 dark:text-white truncate text-sm mb-1">{att.subject}</h4>
                         <p className="text-[10px] text-slate-500 truncate font-mono uppercase tracking-tighter">📎 {att.filename}</p>
                       </div>
                       <button 
                        onClick={() => importFromGmail(att)}
                        className="bg-hunkar text-altin px-6 py-2.5 rounded-xl font-display font-bold text-[10px] tracking-widest shadow-md hover:brightness-125 transition-all whitespace-nowrap"
                       >
                         HIFZET ✒️
                       </button>
                    </div>
                  ))
                )}
             </div>
             
             <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[10px] text-slate-400 font-serif italic">Seçilen fasıl doğrudan bu ünitenin mahzenine kaydedilecektir.</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFView;
