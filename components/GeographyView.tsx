
import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { getHistoricalLocations } from '../services/geminiService';

interface GeographyViewProps {
  course: Course;
}

const GeographyView: React.FC<GeographyViewProps> = ({ course }) => {
  const [data, setData] = useState<{text: string, chunks: any[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLoc, setSelectedLoc] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getHistoricalLocations(
          course.name, 
          `${course.name} tarihindeki en önemli 5-7 arası stratejik lokasyon, savaş alanı, başkent ve ticaret merkezi. Her biri için harita linki sağla.`
        );
        setData(result);
        // İlk geçerli lokasyonu otomatik seç
        const firstLoc = result?.chunks.find((c: any) => c.maps);
        if (firstLoc) setSelectedLoc(firstLoc);
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
      <div className="flex flex-col items-center justify-center py-32 animate-pulse">
        <div className="w-20 h-20 border-8 border-altin border-t-hunkar rounded-full animate-spin mb-8"></div>
        <p className="text-hunkar dark:text-altin font-display tracking-[0.3em] uppercase text-sm">Harita-i Tarih Çiziliyor...</p>
        <p className="mt-2 text-[10px] text-slate-400 font-serif italic">"Arzın ahvali vakanüvisin ufkudur."</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Header Section */}
      <div className="bg-hunkar p-8 rounded-[3rem] border-4 border-altin shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-altin tracking-widest uppercase mb-4">Harita-i Tarih-i {course.name}</h2>
          <div className="w-32 h-1 bg-altin/30 mb-6"></div>
          <p className="text-orange-50 font-serif italic text-base sm:text-lg leading-relaxed opacity-90">
            {data?.text}
          </p>
        </div>
        <div className="absolute right-[-40px] bottom-[-40px] opacity-10 text-[200px] rotate-12 pointer-events-none select-none">🌍</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Location List */}
        <div className="lg:col-span-4 space-y-4 max-h-[700px] overflow-y-auto pr-2 no-scrollbar">
          <h3 className="text-[10px] font-display font-black text-hunkar dark:text-altin uppercase tracking-[0.4em] mb-4 sticky top-0 bg-parshmen/80 dark:bg-slate-900/80 backdrop-blur-md py-2 z-10">Mühim Mevkiler ve Karargahlar</h3>
          
          {data?.chunks.filter((c: any) => c.maps).map((chunk: any, i: number) => (
            <button 
              key={i}
              onClick={() => setSelectedLoc(chunk)}
              className={`w-full text-left p-6 rounded-[2rem] border-2 transition-all group relative overflow-hidden ${
                selectedLoc === chunk 
                  ? 'bg-hunkar border-altin shadow-xl scale-[1.02]' 
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-altin/50'
              }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:scale-110 ${
                  selectedLoc === chunk ? 'bg-altin/20 text-altin' : 'bg-slate-50 dark:bg-slate-900 text-slate-400'
                }`}>
                  {chunk.maps.title.toLowerCase().includes('savaş') || chunk.maps.title.toLowerCase().includes('battle') ? '⚔️' : 
                   chunk.maps.title.toLowerCase().includes('başkent') || chunk.maps.title.toLowerCase().includes('capital') ? '👑' : '📍'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-display font-bold truncate text-sm uppercase tracking-wider ${
                    selectedLoc === chunk ? 'text-altin' : 'text-slate-900 dark:text-white'
                  }`}>
                    {chunk.maps.title}
                  </h4>
                  <p className={`text-[10px] font-serif italic mt-1 ${
                    selectedLoc === chunk ? 'text-orange-100/60' : 'text-slate-500'
                  }`}>
                    Stratejik inceleme için tıkla
                  </p>
                </div>
              </div>
              {selectedLoc === chunk && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-altin/10 rounded-full blur-2xl -translate-y-8 translate-x-8"></div>
              )}
            </button>
          ))}
        </div>

        {/* Right Side: Interactive Map Preview */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-[3rem] border-4 border-altin shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col">
            {selectedLoc ? (
              <>
                <div className="flex items-center justify-between mb-4 px-4">
                   <div className="flex items-center gap-3">
                     <span className="text-2xl animate-bounce-subtle">🧭</span>
                     <h3 className="text-xl font-display font-black text-hunkar dark:text-altin uppercase tracking-widest">{selectedLoc.maps.title}</h3>
                   </div>
                   <a 
                    href={selectedLoc.maps.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-altin text-hunkar px-6 py-2 rounded-full font-display font-bold text-[10px] tracking-widest shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
                   >
                     <span>TAM EKRAN</span> ↗
                   </a>
                </div>
                
                <div className="flex-1 rounded-[2rem] overflow-hidden border-2 border-slate-100 dark:border-slate-800 bg-slate-200 dark:bg-black/40 relative">
                   <iframe 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, minHeight: '400px' }} 
                    loading="lazy" 
                    allowFullScreen 
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/search?key=${process.env.API_KEY || ''}&q=${encodeURIComponent(selectedLoc.maps.title + ' historical site')}`}
                    className="grayscale-[0.4] hover:grayscale-0 transition-all duration-700"
                   ></iframe>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                <div className="text-8xl mb-6 opacity-10">🧭</div>
                <h3 className="text-2xl font-display font-bold text-slate-300 uppercase">Bir Mevki Seçiniz</h3>
                <p className="text-slate-400 font-serif italic max-w-sm mt-4">Sol taraftaki listeden bir lokasyon seçerek tarihsel atlası inceleyebilirsiniz.</p>
              </div>
            )}
          </div>

          {/* Historical Lore / Tip Section */}
          <div className="bg-parshmen dark:bg-slate-950 p-8 rounded-[3rem] border-2 border-altin/30 shadow-inner">
            <h4 className="text-xs font-display font-black text-hunkar dark:text-altin uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
               <span className="text-xl">🏛️</span> COĞRAFYA-İ STRATEJİ NOTU
            </h4>
            <p className="text-sm text-slate-700 dark:text-orange-50/70 font-serif italic leading-relaxed">
              Tarihi olayların geçtiği coğrafyayı anlamak, o dönemin lojistik, askeri ve ticari kararlarını çözümlemenin anahtarıdır. 
              Örneğin, {course.name} döneminde seçilen bu mevkiler, ikmal hatlarının kesişim noktaları veya doğal savunma kaleleri oldukları için hayati önem taşımışlardır.
            </p>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default GeographyView;
