
import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { getHistoricalLocations } from '../services/geminiService';

interface GeographyViewProps {
  course: Course;
}

const GeographyView: React.FC<GeographyViewProps> = ({ course }) => {
  const [data, setData] = useState<{text: string, chunks: any[]} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getHistoricalLocations(course.name, `${course.name} tarihindeki önemli şehirler, savaş alanları ve ticaret yolları.`);
        setData(result);
      } catch (error) {
        console.error("Coğrafya hatası:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [course]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-slate-500 font-serif italic">Tarihsel coğrafya haritaları yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6 flex items-center gap-3">
          <span className="text-3xl">🌍</span> Tarihsel Coğrafya ve Lokasyonlar
        </h2>
        
        <div className="prose prose-slate max-w-none mb-10 text-slate-600 leading-relaxed italic">
          {data?.text}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data?.chunks.map((chunk, i) => (
            chunk.maps && (
              <a 
                key={i} 
                href={chunk.maps.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:border-rose-300 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">📍</span>
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full">Haritada Aç ↗</span>
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors">{chunk.maps.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">Bu konumun tarihsel bağlamını ve bugünkü durumunu incelemek için tıklayın.</p>
              </a>
            )
          ))}
        </div>

        {(!data?.chunks || data.chunks.length === 0) && (
          <div className="p-12 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
            <p className="text-slate-400 font-serif">Bu bağlam için özel harita verisi bulunamadı.</p>
          </div>
        )}
      </div>

      <div className="bg-emerald-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
            <span>🎓</span> Akademik İpucu
          </h4>
          <p className="text-emerald-100 text-sm leading-relaxed opacity-90">
            Tarih, sadece olaylar dizisi değil; coğrafyanın sunduğu imkanlar ve engellerle şekillenen bir süreçtir. "Bozkır Kültürü"nün yayılımını veya "İpek Yolu" güzergahlarını harita üzerinde incelemek, devletlerin stratejilerini anlamanıza yardımcı olur.
          </p>
        </div>
        <div className="absolute right-[-20px] top-[-20px] opacity-10 text-[180px] select-none rotate-12">🧭</div>
      </div>
    </div>
  );
};

export default GeographyView;
