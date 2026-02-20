
import React, { useState, useEffect } from 'react';
import { Course, ExamPrediction } from '../types';
import { generateExamPredictions } from '../services/geminiService';
import { getUnitPDF, savePredictions, getPredictions } from '../services/dbService';
import { blobToBase64 } from '../services/pdfService';

interface ExamPredictionViewProps {
  course: Course;
  selectedUnit: number;
}

const ExamPredictionView: React.FC<ExamPredictionViewProps> = ({ course, selectedUnit }) => {
  const [predictions, setPredictions] = useState<ExamPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasPdf, setHasPdf] = useState(false);

  useEffect(() => {
    loadPredictions();
    checkPdf();
  }, [course.id, selectedUnit]);

  const checkPdf = async () => {
    const pdf = await getUnitPDF(course.id, selectedUnit);
    setHasPdf(!!pdf);
  };

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const saved = await getPredictions(course.id, selectedUnit);
      if (saved && saved.length > 0) {
        setPredictions(saved);
      } else {
        setPredictions([]);
      }
    } catch (error) {
      console.error("Tahminler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const pdfBlob = await getUnitPDF(course.id, selectedUnit);
      if (!pdfBlob) {
        alert("Fasıl PDF'i bulunamadı.");
        return;
      }

      const base64 = await blobToBase64(pdfBlob);
      const data = await generateExamPredictions(course.name, base64);
      
      if (data && data.length > 0) {
        setPredictions(data);
        await savePredictions(course.id, selectedUnit, data);
      } else {
        alert("Tahminler oluşturulamadı.");
      }
    } catch (error) {
      console.error("Tahmin oluşturma hatası:", error);
      alert("Sınav tahminleri oluşturulurken bir hata oluştu.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-14 h-14 border-4 border-altin border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-slate-500 font-serif italic">Keşf-i Sual mütalaa ediliyor...</p>
      </div>
    );
  }

  if (predictions.length === 0 && !isGenerating) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center animate-in fade-in duration-500">
        <div className="text-7xl mb-8 opacity-20">🔮</div>
        <h3 className="text-2xl font-display font-bold text-hunkar dark:text-altin uppercase tracking-widest mb-4">Sınav Tahminleri Henüz Yok</h3>
        <p className="text-slate-500 text-sm mb-10 font-serif italic leading-relaxed">
          Müverrih Oğuz, bu ünite için henüz sınav tahmini yapılmamış. 
          {hasPdf ? "Fasıl PDF'ini analiz ederek muhtemel sınav sorularını keşfetmek için aşağıdaki butonu kullanabilirsin." : "Lütfen önce ünite PDF'ini yükle."}
        </p>
        {hasPdf && (
          <button 
            onClick={handleGenerate}
            className="bg-hunkar text-altin px-10 py-4 rounded-full font-display font-black text-sm shadow-xl border-2 border-altin active:scale-95 transition-all hover:brightness-110"
          >
            🔮 KEŞF-İ SUAL BAŞLAT
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="bg-hunkar p-8 rounded-[3rem] border-4 border-altin shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-altin/10 rounded-bl-full -mr-8 -mt-8"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="text-6xl">🔮</div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-display font-black text-altin tracking-widest uppercase mb-2">KEŞF-İ SUAL (SINAV TAHMİNİ)</h2>
            <p className="text-orange-50/70 font-serif italic text-sm">
              AUZEF sınav standartlarına göre {selectedUnit}. fasıl için hazırlanan muhtemel soru noktaları.
            </p>
          </div>
          {hasPdf && (
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="ml-auto bg-altin text-hunkar px-6 py-3 rounded-full font-display font-black text-[10px] tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isGenerating ? "ANALİZ EDİLİYOR..." : "TAHMİNLERİ YENİLE"}
            </button>
          )}
        </div>
      </div>

      {isGenerating ? (
        <div className="py-24 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-altin/20">
          <div className="w-16 h-16 border-4 border-hunkar border-t-transparent rounded-full animate-spin mb-8"></div>
          <h4 className="font-display font-bold text-hunkar dark:text-altin uppercase tracking-widest animate-pulse">Asistan Faslı Analiz Ediyor...</h4>
          <p className="mt-4 text-sm text-slate-500 font-serif italic">AUZEF soru kalıpları taranıyor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {predictions.map((pred, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-altin/10 shadow-xl overflow-hidden group hover:border-altin/40 transition-all">
              <div className="flex flex-col md:flex-row">
                <div className={`w-full md:w-12 shrink-0 flex items-center justify-center p-4 md:p-0 ${
                  pred.importance === 'high' ? 'bg-red-500' : pred.importance === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                }`}>
                  <span className="text-white font-display font-black text-xs md:-rotate-90 uppercase tracking-widest">
                    {pred.importance === 'high' ? 'KRİTİK' : pred.importance === 'medium' ? 'MÜHİM' : 'OLASI'}
                  </span>
                </div>
                
                <div className="flex-1 p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-display font-bold text-hunkar dark:text-altin uppercase tracking-wider mb-2">{pred.topic}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-altin/10 text-altin px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-altin/20">
                          {pred.likelyQuestionType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-display font-black text-slate-400 uppercase tracking-[0.2em]">Neden Çıkabilir?</h4>
                      <p className="text-sm text-slate-600 dark:text-orange-50/60 font-serif italic leading-relaxed">
                        {pred.reason}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-display font-black text-slate-400 uppercase tracking-[0.2em]">Kritik Bilgiler (Hıfz Et)</h4>
                      <ul className="space-y-2">
                        {pred.keyFacts.map((fact, j) => (
                          <li key={j} className="flex items-start gap-3 text-sm text-slate-700 dark:text-orange-50/80">
                            <span className="text-altin mt-1">📜</span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-parshmen dark:bg-slate-800 p-8 rounded-[3rem] border-2 border-altin/20 text-center">
        <h4 className="text-xs font-display font-black text-hunkar dark:text-altin uppercase tracking-widest mb-4">Vakanüvis'in Sınav Öğüdü</h4>
        <p className="text-sm text-slate-600 dark:text-orange-50/60 font-serif italic leading-relaxed max-w-2xl mx-auto">
          "İlim, ehli olmayana verilmez." Müverrih Oğuz, bu tahminler AUZEF'in geçmiş yıllardaki soru sorma üslubu ve akademik ağırlık merkezleri gözetilerek hazırlanmıştır. Lakin asıl olan kitabın tamamına vakıf olmaktır. Bu noktalar senin "kale burçların" olsun, buraları asla boş bırakma.
        </p>
      </div>
    </div>
  );
};

export default ExamPredictionView;
