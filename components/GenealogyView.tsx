
import React, { useState, useEffect } from 'react';
import { Course, RulerNode } from '../types';
import { extractGenealogyFromPDF } from '../services/geminiService';
import { getUnitPDF, saveGenealogy, getGenealogy } from '../services/dbService';
import { blobToBase64 } from '../services/pdfService';

interface GenealogyViewProps {
  course: Course;
  selectedUnit: number;
}

const GenealogyView: React.FC<GenealogyViewProps> = ({ course, selectedUnit }) => {
  const [rulers, setRulers] = useState<RulerNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [hasPdf, setHasPdf] = useState(false);

  useEffect(() => {
    loadGenealogy();
    checkPdf();
  }, [course.id, selectedUnit]);

  const checkPdf = async () => {
    const pdf = await getUnitPDF(course.id, selectedUnit);
    setHasPdf(!!pdf);
  };

  const loadGenealogy = async () => {
    setLoading(true);
    try {
      const saved = await getGenealogy(course.id, selectedUnit);
      if (saved && saved.length > 0) {
        setRulers(saved);
      } else {
        setRulers([]);
      }
    } catch (error) {
      console.error("Soy ağacı hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async () => {
    setIsExtracting(true);
    try {
      const pdfBlob = await getUnitPDF(course.id, selectedUnit);
      if (!pdfBlob) {
        alert("Fasıl PDF'i bulunamadı.");
        return;
      }

      const base64 = await blobToBase64(pdfBlob);
      const data = await extractGenealogyFromPDF(course.name, base64);
      
      if (data && data.length > 0) {
        setRulers(data);
        await saveGenealogy(course.id, selectedUnit, data);
      } else {
        alert("Şecere çıkarılamadı.");
      }
    } catch (error) {
      console.error("Şecere çıkarma hatası:", error);
      alert("Şecere oluşturulurken bir hata oluştu.");
    } finally {
      setIsExtracting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-hunkar border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-slate-500 font-serif italic">Hanedan kayıtları düzenleniyor...</p>
      </div>
    );
  }

  if (rulers.length === 0 && !isExtracting) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-in fade-in duration-500">
        <div className="text-7xl mb-8 opacity-20">🌳</div>
        <h3 className="text-2xl font-display font-bold text-hunkar dark:text-altin uppercase tracking-widest mb-4">Şecere Kaydı Bulunamadı</h3>
        <p className="text-slate-500 text-sm mb-10 font-serif italic leading-relaxed">
          Müverrih Oğuz, bu ünite için henüz bir şecere kaydı oluşturulmamış. 
          {hasPdf ? "Fasıl PDF'inden otomatik olarak şecere çıkarmak için aşağıdaki butonu kullanabilirsin." : "Lütfen önce ünite PDF'ini yükle."}
        </p>
        {hasPdf && (
          <button 
            onClick={handleExtract}
            className="bg-hunkar text-altin px-10 py-4 rounded-full font-display font-black text-sm shadow-xl border-2 border-altin active:scale-95 transition-all hover:brightness-110"
          >
            🌳 ŞECERE-İ ATİK ÇIKAR
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 pb-20">
      <div className="flex justify-between items-center mb-10 px-4">
        <h2 className="text-xl font-display font-black text-hunkar dark:text-altin tracking-widest uppercase">Şecere-i Atik</h2>
        {hasPdf && (
          <button 
            onClick={handleExtract}
            disabled={isExtracting}
            className="text-[10px] font-bold text-hunkar dark:text-altin hover:underline disabled:opacity-30"
          >
            {isExtracting ? "Analiz Ediliyor..." : "Yenile"}
          </button>
        )}
      </div>

      {isExtracting ? (
        <div className="py-24 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-altin/20">
          <div className="w-16 h-16 border-4 border-hunkar border-t-transparent rounded-full animate-spin mb-8"></div>
          <h4 className="font-display font-bold text-hunkar dark:text-altin uppercase tracking-widest animate-pulse">Asistan Faslı Tarıyor...</h4>
          <p className="mt-4 text-sm text-slate-500 font-serif italic">Hanedan ve devlet adamları listeleniyor.</p>
        </div>
      ) : (
        <div className="relative border-l-4 border-altin/30 ml-6 space-y-12 pb-12">
          {rulers.map((ruler, idx) => (
            <div key={idx} className="relative pl-12 group">
              <div className="absolute left-[-14px] top-0 w-6 h-6 rounded-full bg-parshmen border-4 border-hunkar shadow-lg group-hover:scale-125 transition-transform z-10"></div>
              
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-altin/10 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-altin/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-altin/10 transition-colors"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <h3 className="text-2xl font-display font-bold text-hunkar dark:text-altin">{ruler.name}</h3>
                  <span className="text-[10px] font-black bg-hunkar text-altin px-4 py-1.5 rounded-full uppercase tracking-widest border border-altin/30">
                    {ruler.period}
                  </span>
                </div>
                <p className="text-base text-slate-600 dark:text-orange-50/70 leading-relaxed font-serif italic relative z-10">
                  "{ruler.keyAction}"
                </p>
                <div className="mt-6 flex gap-3 relative z-10">
                  <div className="w-3 h-3 rounded-full bg-altin shadow-sm"></div>
                  <div className="w-3 h-3 rounded-full bg-hunkar/20"></div>
                  <div className="w-3 h-3 rounded-full bg-hunkar/20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-parshmen dark:bg-slate-800 p-8 rounded-[3rem] border-2 border-altin/20 mt-8">
        <h4 className="text-hunkar dark:text-altin font-display font-bold flex items-center gap-3 mb-4 uppercase tracking-widest text-xs">
          <span>📜</span> Vakanüvis Notu
        </h4>
        <p className="text-sm text-slate-600 dark:text-orange-50/60 leading-relaxed font-serif italic">
          "Devlet-i Ebed Müddet" fikri, hanedanın devamlılığı üzerine inşa edilmiştir. Bu şecere, {selectedUnit}. fasılda zikredilen mühim şahsiyetlerin tarihsel silsilesini göstermektedir.
        </p>
      </div>
    </div>
  );
};

export default GenealogyView;

