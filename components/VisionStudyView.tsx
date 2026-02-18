
import React, { useState, useRef } from 'react';
import { analyzeHistoryImage } from '../services/geminiService';

const VisionStudyView: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setImage(reader.result as string);
        handleAnalyze(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (base64: string) => {
    setLoading(true);
    setAnalysis(null);
    try {
      const result = await analyzeHistoryImage(base64);
      setAnalysis(result);
    } catch (error) {
      alert("Ferman teşhis edilemedi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="bg-hunkar p-8 rounded-[3rem] border-4 border-altin shadow-2xl text-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-display font-black text-altin tracking-widest uppercase mb-2">Hazine-i Evrak Teşhisi</h2>
          <p className="text-orange-50 font-serif italic text-sm opacity-80">
            Kitap sayfasını veya notlarını çek, asistanın senin için tahlil etsin.
          </p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 bg-altin text-hunkar px-10 py-4 rounded-full font-display font-black text-xs tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-3 mx-auto"
          >
            <span>📸</span> FERMANI GÖSTER
          </button>
          <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-[120px] rotate-12 pointer-events-none select-none">👁️</div>
      </div>

      {loading && (
        <div className="py-20 text-center">
          <div className="w-16 h-16 border-4 border-altin border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-hunkar dark:text-altin font-display tracking-widest animate-pulse uppercase">Satırlar İnceleniyor...</p>
        </div>
      )}

      {image && !loading && (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
           <img src={image} alt="Taranan Belge" className="w-full h-48 object-cover opacity-50 grayscale hover:grayscale-0 transition-all" />
           
           {analysis && (
             <div className="p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="border-l-4 border-altin pl-6">
                  <h3 className="text-[10px] font-display font-black text-hunkar dark:text-altin uppercase tracking-[0.3em] mb-2">Mücmel Özet</h3>
                  <p className="text-slate-700 dark:text-orange-50/80 font-serif italic leading-relaxed">{analysis.summary}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="bg-parshmen dark:bg-slate-800/40 p-6 rounded-2xl border border-altin/10">
                      <h4 className="text-[9px] font-display font-black text-hunkar dark:text-altin uppercase mb-4 tracking-widest">🗓️ Kritik Tarihler</h4>
                      <ul className="space-y-2">
                        {analysis.dates.map((d: string, i: number) => (
                          <li key={i} className="text-xs font-serif italic text-slate-600 dark:text-slate-400">• {d}</li>
                        ))}
                      </ul>
                   </div>
                   <div className="bg-parshmen dark:bg-slate-800/40 p-6 rounded-2xl border border-altin/10">
                      <h4 className="text-[9px] font-display font-black text-hunkar dark:text-altin uppercase mb-4 tracking-widest">👑 Şahsiyetler</h4>
                      <ul className="space-y-2">
                        {analysis.figures.map((f: string, i: number) => (
                          <li key={i} className="text-xs font-serif italic text-slate-600 dark:text-slate-400">• {f}</li>
                        ))}
                      </ul>
                   </div>
                </div>

                <div className="bg-hunkar text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                   <h4 className="text-[10px] font-display font-black text-altin uppercase tracking-widest mb-3">📝 MUHTEMEL İMTİHAN SORUSU</h4>
                   <p className="text-sm font-serif italic text-orange-50 leading-relaxed relative z-10">{analysis.quizQuestion}</p>
                   <div className="absolute right-0 bottom-0 opacity-10 text-6xl">🖋️</div>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default VisionStudyView;
