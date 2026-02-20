
import React, { useState } from 'react';
import { Course, TreasureHint } from '../../types';
import { generateTreasureHunt } from '../../services/geminiService';
import { getUnitPDF } from '../../services/dbService';
import { blobToBase64 } from '../../services/pdfService';

interface TreasureHuntProps {
  course: Course;
  selectedUnit: number;
  onBack: () => void;
}

const TreasureHunt: React.FC<TreasureHuntProps> = ({ course, selectedUnit, onBack }) => {
  const [hints, setHints] = useState<TreasureHint[]>([]);
  const [loading, setLoading] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [activeHint, setActiveHint] = useState<number | null>(null);

  const startHunt = async () => {
    setLoading(true);
    try {
      const pdfBlob = await getUnitPDF(course.id, selectedUnit);
      if (!pdfBlob) {
        alert("Lütfen önce fasıl PDF'ini yükle.");
        onBack();
        return;
      }
      const base64 = await blobToBase64(pdfBlob);
      const data = await generateTreasureHunt(course.name, base64);
      setHints(data);
      setFoundCount(0);
      setActiveHint(null);
    } catch (error) {
      console.error("Hazine avı başlatılamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = () => {
    if (activeHint === null) return;
    const h = hints[activeHint];
    if (userInput.toLowerCase().trim() === h.answer.toLowerCase().trim()) {
      const newHints = [...hints];
      newHints[activeHint].isFound = true;
      setHints(newHints);
      setFoundCount(prev => prev + 1);
      setUserInput('');
      setActiveHint(null);
      alert("Tebrikler! Hazineyi buldun.");
    } else {
      alert("Maalesef yanlış bilgi. Fasıl metnini daha dikkatli oku.");
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-altin shadow-xl">
        <div className="w-16 h-16 border-4 border-hunkar border-t-transparent rounded-full animate-spin mb-8"></div>
        <h4 className="font-display font-bold text-hunkar dark:text-altin uppercase tracking-widest animate-pulse">Hazine Haritası Çiziliyor...</h4>
      </div>
    );
  }

  if (hints.length === 0) {
    return (
      <div className="py-12 px-8 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-altin shadow-xl text-center space-y-8">
        <div className="text-7xl">🗺️</div>
        <h2 className="text-2xl font-display font-black text-hunkar dark:text-altin uppercase tracking-widest">Hazine Avı</h2>
        <p className="text-slate-500 font-serif italic max-w-md mx-auto">
          Fasıl metninde gizlenmiş mühim tarihleri, isimleri ve yerleri bulmaya hazır mısın? İpuçlarını takip et, hazineyi keşfet.
        </p>
        <button onClick={startHunt} className="bg-hunkar text-altin px-12 py-5 rounded-full font-display font-black text-sm tracking-widest border-2 border-altin shadow-xl active:scale-95 transition-all">AVI BAŞLAT</button>
        <button onClick={onBack} className="block mx-auto text-xs font-bold text-slate-400 hover:underline">VAZGEÇ</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-hunkar p-4 rounded-full border-2 border-altin text-altin px-8">
        <span className="font-display font-bold text-xs uppercase tracking-widest">Bulunan Hazineler: {foundCount} / {hints.length}</span>
        <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest hover:underline">Kapat</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {hints.map((h, idx) => (
          <div key={idx} className={`p-6 rounded-[2rem] border-2 transition-all ${h.isFound ? 'bg-emerald-50 border-emerald-200 opacity-60' : 'bg-white dark:bg-slate-900 border-altin/10 shadow-md'}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${h.isFound ? 'bg-emerald-500 text-white' : 'bg-altin/10 text-altin'}`}>
                  {h.isFound ? '✅' : '💎'}
                </div>
                <p className={`text-sm font-serif italic ${h.isFound ? 'text-emerald-700 line-through' : 'text-slate-600 dark:text-orange-50/70'}`}>
                  {h.hint}
                </p>
              </div>
              {!h.isFound && (
                <button 
                  onClick={() => setActiveHint(idx)}
                  className="bg-hunkar text-altin px-4 py-2 rounded-full font-display font-black text-[10px] tracking-widest border border-altin"
                >
                  CEVAPLA
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {activeHint !== null && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setActiveHint(null)}>
          <div className="bg-parshmen dark:bg-slate-900 w-full max-w-md rounded-[3rem] border-4 border-altin shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-display font-black text-hunkar dark:text-altin uppercase tracking-widest text-center">Hazineyi Keşfet</h3>
            <p className="text-sm text-slate-500 font-serif italic text-center">"{hints[activeHint].hint}"</p>
            <input 
              type="text"
              placeholder="Cevabı buraya yaz..."
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border-2 border-altin/20 rounded-2xl px-6 py-4 outline-none focus:border-altin transition-all"
            />
            <div className="flex gap-3">
              <button onClick={checkAnswer} className="flex-1 bg-hunkar text-altin py-4 rounded-2xl font-display font-black text-xs tracking-widest border-2 border-altin">KONTROL ET</button>
              <button onClick={() => setActiveHint(null)} className="flex-1 bg-white text-slate-400 py-4 rounded-2xl font-display font-black text-xs tracking-widest border-2 border-slate-100">İPTAL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreasureHunt;
