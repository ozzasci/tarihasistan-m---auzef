
import React, { useState, useEffect } from 'react';
import { fetchAuzefNews } from '../services/geminiService';
import { NewsAnnouncement } from '../types';

interface NewsTickerProps {
  onNavigate: (tab: string) => void;
}

const NewsTicker: React.FC<NewsTickerProps> = ({ onNavigate }) => {
  const news = [
    { text: "📖 KİTAP: FASIL PDF'LERİNİ OKU VE ANALİZ ET", tab: "pdf" },
    { text: "📜 HÜLASA: ÜNİTE ÖZETLERİNİ VE KRİTİK NOTLARI ÇIKAR", tab: "study" },
    { text: "🎙️ SADÂ: DERS NOTLARINI SESLİ DİNLE", tab: "sadâ" },
    { text: "📸 GÖRSEL: HARİTA VE MİNYATÜRLERİ İNCELE", tab: "visual" },
    { text: "📝 İMTİHAN: ÜNİTE SONU TESTLERİYLE KENDİNİ DENE", tab: "quiz" },
    { text: "🔮 KEŞF-İ SUAL: SINAV TAHMİNLERİNİ GÖR", tab: "prediction" },
    { text: "🎮 DARÜ'L-EĞLENCE: TARİHSEL OYUNLARLA ÖĞREN", tab: "games" },
    { text: "📖 LÜGATÇE: AKADEMİK TERİMLERİ ÖĞREN", tab: "glossary" },
    { text: "👤 ZAMAN YOLCUSU: TARİHİ ŞAHSİYETLERLE MÜLAKAT YAP", tab: "interview" }
  ];

  return (
    <div className="bg-hunkar text-altin border-b-2 border-altin/50 py-2 relative overflow-hidden whitespace-nowrap z-50 shadow-md h-10 flex items-center">
      <div className="flex items-center w-full">
        <div className="bg-altin text-hunkar px-3 py-1 font-display font-black text-[9px] tracking-widest z-20 shadow-lg mr-4 ml-2 rounded-sm shrink-0 uppercase">
          Havadis-i Cedid
        </div>
        <div className="animate-marquee inline-block">
          {news.map((item, i) => (
            <button 
              key={i} 
              onClick={() => onNavigate(item.tab)}
              className="mx-10 font-serif italic text-[11px] sm:text-xs font-bold tracking-wide uppercase hover:text-white hover:underline transition-colors decoration-altin decoration-2 underline-offset-4 cursor-pointer"
              title="İlgili bölüme gitmek için tıklayınız"
            >
              {item.text}
            </button>
          ))}
          {/* Loop sürekliliği için kopya */}
          {news.map((item, i) => (
            <button 
              key={`dup-${i}`} 
              onClick={() => onNavigate(item.tab)}
              className="mx-10 font-serif italic text-[11px] sm:text-xs font-bold tracking-wide uppercase hover:text-white hover:underline transition-colors decoration-altin decoration-2 underline-offset-4 cursor-pointer"
              title="İlgili bölüme gitmek için tıklayınız"
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 60s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default NewsTicker;
