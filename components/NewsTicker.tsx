
import React, { useState, useEffect } from 'react';
import { fetchAuzefNews } from '../services/geminiService';

const NewsTicker: React.FC = () => {
  const [news, setNews] = useState<string[]>([
    "⌛ HAVADİS-İ CEDİD YÜKLENİYOR...",
    "📢 BAHAR DÖNEMİ ARA SINAV (VİZE): 26-27 NİSAN 2025",
    "🎓 BAHAR DÖNEMİ BİTİRME (FİNAL): 14-15 HAZİRAN 2025"
  ]);

  useEffect(() => {
    const updateNews = async () => {
      const latestNews = await fetchAuzefNews();
      if (latestNews && latestNews.length > 0) {
        setNews(latestNews);
      }
    };
    updateNews();
    // Her 1 saatte bir veriyi tazele
    const interval = setInterval(updateNews, 3600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-hunkar text-altin border-b-2 border-altin/50 py-2 relative overflow-hidden whitespace-nowrap z-50 shadow-md h-10 flex items-center">
      <div className="flex items-center w-full">
        <div className="bg-altin text-hunkar px-3 py-1 font-display font-black text-[9px] tracking-widest z-20 shadow-lg mr-4 ml-2 rounded-sm shrink-0">
          HAVADİS-İ CEDİD
        </div>
        <div className="animate-marquee inline-block">
          {news.map((item, i) => (
            <span key={i} className="mx-10 font-serif italic text-[11px] sm:text-xs font-bold tracking-wide uppercase">
              {item}
            </span>
          ))}
          {/* Loop sürekliliği için kopya */}
          {news.map((item, i) => (
            <span key={`dup-${i}`} className="mx-10 font-serif italic text-[11px] sm:text-xs font-bold tracking-wide uppercase">
              {item}
            </span>
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
