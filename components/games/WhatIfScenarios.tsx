
import React, { useState } from 'react';
import { Course, WhatIfScenario } from '../../types';
import { generateWhatIfScenario } from '../../services/geminiService';
import { getUnitPDF } from '../../services/dbService';
import { blobToBase64 } from '../../services/pdfService';

interface WhatIfScenariosProps {
  course: Course;
  selectedUnit: number;
  onBack: () => void;
}

const WhatIfScenarios: React.FC<WhatIfScenariosProps> = ({ course, selectedUnit, onBack }) => {
  const [scenario, setScenario] = useState<WhatIfScenario | null>(null);
  const [loading, setLoading] = useState(false);

  const startScenario = async () => {
    setLoading(true);
    try {
      const pdfBlob = await getUnitPDF(course.id, selectedUnit);
      if (!pdfBlob) {
        alert("Lütfen önce fasıl PDF'ini yükle.");
        onBack();
        return;
      }
      const base64 = await blobToBase64(pdfBlob);
      const data = await generateWhatIfScenario(course.name, base64);
      setScenario(data);
    } catch (error) {
      console.error("Senaryo başlatılamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-altin shadow-xl">
        <div className="w-16 h-16 border-4 border-hunkar border-t-transparent rounded-full animate-spin mb-8"></div>
        <h4 className="font-display font-bold text-hunkar dark:text-altin uppercase tracking-widest animate-pulse">Zaman Çizgisi Bükülüyor...</h4>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="py-12 px-8 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-altin shadow-xl text-center space-y-8">
        <div className="text-7xl">🎭</div>
        <h2 className="text-2xl font-display font-black text-hunkar dark:text-altin uppercase tracking-widest">Vaka-i Hayal</h2>
        <p className="text-slate-500 font-serif italic max-w-md mx-auto">
          "Ya şöyle olsaydı?" Tarihin akışını değiştiren bir karar farklı verilseydi dünya nasıl bir yer olurdu? Fasıl metnindeki olaylar üzerinden alternatif bir tarih yolculuğuna çık.
        </p>
        <button onClick={startScenario} className="bg-hunkar text-altin px-12 py-5 rounded-full font-display font-black text-sm tracking-widest border-2 border-altin shadow-xl active:scale-95 transition-all">HAYALİ BAŞLAT</button>
        <button onClick={onBack} className="block mx-auto text-xs font-bold text-slate-400 hover:underline">VAZGEÇ</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center bg-hunkar p-4 rounded-full border-2 border-altin text-altin px-8">
        <span className="font-display font-bold text-xs uppercase tracking-widest">Alternatif Tarih Senaryosu</span>
        <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest hover:underline">Kapat</button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border-4 border-altin/20 shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-altin/5 rounded-bl-full -mr-12 -mt-12"></div>
        
        <div className="text-center space-y-4 relative z-10">
          <h3 className="text-3xl font-display font-black text-hunkar dark:text-altin uppercase tracking-widest">{scenario.title}</h3>
          <div className="w-20 h-1 bg-altin mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-[10px] font-display font-black text-slate-400 uppercase tracking-[0.2em]">Gerçek Vak'a</h4>
              <p className="text-sm text-slate-600 dark:text-orange-50/60 font-serif italic leading-relaxed">
                {scenario.description}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-display font-black text-altin uppercase tracking-[0.2em]">Hayal-i Muhal (Alternatif Akış)</h4>
              <p className="text-base text-hunkar dark:text-white font-serif font-bold leading-relaxed">
                {scenario.alternativeHistory}
              </p>
            </div>
          </div>

          <div className="bg-parshmen dark:bg-slate-800 p-8 rounded-[2.5rem] border-2 border-altin/20 space-y-6">
            <h4 className="text-[10px] font-display font-black text-hunkar dark:text-altin uppercase tracking-[0.2em] text-center">Muhtemel Neticeler</h4>
            <ul className="space-y-4">
              {scenario.consequences.map((c, i) => (
                <li key={i} className="flex items-start gap-4 text-sm text-slate-700 dark:text-orange-50/80">
                  <span className="w-6 h-6 rounded-full bg-altin/20 text-altin flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex justify-center">
          <button onClick={startScenario} className="bg-hunkar text-altin px-10 py-4 rounded-full font-display font-black text-xs tracking-widest border-2 border-altin shadow-xl hover:scale-105 active:scale-95 transition-all">YENİ SENARYO ÜRET</button>
        </div>
      </div>
    </div>
  );
};

export default WhatIfScenarios;
