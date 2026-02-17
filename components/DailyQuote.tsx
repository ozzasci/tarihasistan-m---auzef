
import React, { useState, useEffect } from 'react';

const STATIC_QUOTES = [
  { text: "Tarihini bilmeyen bir millet, hafızasını kaybetmiş bir insana benzer.", author: "Halil İnalcık" },
  { text: "Tarih, sadece olaylar dizisi değil; insan iradesinin tecellisidir.", author: "İlber Ortaylı" },
  { text: "Coğrafya kaderdir, tarih ise o kaderi nasıl yaşadığındır.", author: "Anonim Müverrih" },
  { text: "Geçmişi iyi bil ki, geleceğe sağlam basasın.", author: "Emir Timur" },
  { text: "İlim, rütbelerin en yücesidir.", author: "Hz. Ali" },
  { text: "Arşivi olmayanın hafızası olmaz, hafızası olmayanın yarını olmaz.", author: "İbrahim Müteferrika" }
];

const DailyQuote: React.FC = () => {
  const [quote, setQuote] = useState({ text: "", author: "" });

  useEffect(() => {
    // Günün tarihini baz alarak her gün aynı sözü gösteren basit bir algoritma
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Rastgelelik için index seçimi
    const index = dayOfYear % STATIC_QUOTES.length;
    setQuote(STATIC_QUOTES[index]);
  }, []);

  return (
    <div className="max-w-2xl mx-auto my-8 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="bg-parshmen dark:bg-slate-900/60 p-6 sm:p-10 rounded-[3rem] border-2 border-altin/30 shadow-2xl relative overflow-hidden rumi-border">
        {/* Dekoratif Mühür */}
        <div className="absolute -top-4 -left-4 w-16 h-16 opacity-10 rotate-[-15deg] pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-hunkar dark:text-altin">
            <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 90C28 90 10 72 10 50S28 10 50 10s40 18 40 40-18 40-40 40z" />
            <path d="M50 20c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30-13.5-30-30-30zm0 50c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z" />
          </svg>
        </div>

        <div className="text-center relative z-10">
          <div className="text-[10px] font-display font-black text-hunkar dark:text-altin uppercase tracking-[0.4em] mb-4 opacity-60">
            KÜTÜB-İ HİKMET: GÜNÜN KELÂM-I KİBARI
          </div>
          
          <p className="text-lg sm:text-2xl font-serif font-bold text-slate-800 dark:text-orange-50/90 italic leading-relaxed mb-6">
            "{quote.text}"
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-[1px] bg-altin/40"></div>
            <span className="text-xs font-display font-black text-hunkar dark:text-altin tracking-widest uppercase italic">
              — {quote.author}
            </span>
            <div className="w-12 h-[1px] bg-altin/40"></div>
          </div>
        </div>
        
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-5 text-9xl pointer-events-none rotate-12 select-none">✒️</div>
      </div>
    </div>
  );
};

export default DailyQuote;
