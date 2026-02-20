
import React, { useState, useEffect } from 'react';
import { fetchAuzefNews } from '../services/geminiService';
import { NewsAnnouncement } from '../types';

const NewsTicker: React.FC = () => {
  const [news, setNews] = useState<NewsAnnouncement[]>([
    { text: "📖 KİTAP: FASIL PDF'LERİNİ OKU VE ANALİZ ET", url: "https://auzef.istanbul.edu.tr" },
    { text: "📜 HÜLASA: ÜNİTE ÖZETLERİNİ VE KRİTİK NOTLARI ÇIKAR", url: "https://auzef.istanbul.edu.tr" },
    { text: "🎙️ SADÂ: DERS NOTLARINI SESLİ DİNLE", url: "https://auzef.istanbul.edu.tr" },
    { text: "📸 GÖRSEL: HARİTA VE MİNYATÜRLERİ İNCELE", url: "https://auzef.istanbul.edu.tr" },
    { text: "📝 İMTİHAN: ÜNİTE SONU TESTLERİYLE KENDİNİ DENE", url: "https://auzef.istanbul.edu.tr" },
    { text: "🔮 KEŞF-İ SUAL: SINAV TAHMİNLERİNİ GÖR", url: "https://auzef.istanbul.edu.tr" },
    { text: "🎮 DARÜ'L-EĞLENCE: TARİHSEL OYUNLARLA ÖĞREN", url: "https://auzef.istanbul.edu.tr" },
    { text: "📖 LÜGATÇE: AKADEMİK TERİMLERİ ÖĞREN", url: "https://auzef.istanbul.edu.tr" },
    { text: "👤 ZAMAN YOLCUSU: TARİHİ ŞAHSİYETLERLE MÜLAKAT YAP", url: "https://auzef.istanbul.edu.tr" }
  ]);

  useEffect(() => {
    // Statik içerik kullanıyoruz, ancak gelecekte dinamik duyurular için bu yapı korunabilir.
  }, []);

  return (
    <div className="bg-hunkar text-altin border-b-2 border-altin/50 py-2 relative overflow-hidden whitespace-nowrap z-50 shadow-md h-10 flex items-center">
      <div className="flex items-center w-full">
        <div className="bg-altin text-hunkar px-3 py-1 font-display font-black text-[9px] tracking-widest z-20 shadow-lg mr-4 ml-2 rounded-sm shrink-0 uppercase">
          Havadis-i Cedid
        </div>
        <div className="animate-marquee inline-block">
          {news.map((item, i) => (
            <a 
              key={i} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mx-10 font-serif italic text-[11px] sm:text-xs font-bold tracking-wide uppercase hover:text-white hover:underline transition-colors decoration-altin decoration-2 underline-offset-4"
              title="Duyuruyu açmak için tıklayınız"
            >
              {item.text}
            </a>
          ))}
          {/* Loop sürekliliği için kopya */}
          {news.map((item, i) => (
            <a 
              key={`dup-${i}`} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mx-10 font-serif italic text-[11px] sm:text-xs font-bold tracking-wide uppercase hover:text-white hover:underline transition-colors decoration-altin decoration-2 underline-offset-4"
              title="Duyuruyu açmak için tıklayınız"
            >
              {item.text}
            </a>
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
