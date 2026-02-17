
import React, { useEffect, useState } from 'react';
import { Achievement, CourseId } from '../types';
import { getProgress, getAllPDFs, getTotalStudyMinutes } from '../services/dbService';
import { COURSES } from '../constants';

const AchievementsView: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pdfCount: 0, totalMinutes: 0 });

  const fetchAchievements = async () => {
    setLoading(true);
    const pdfs = await getAllPDFs();
    const totalMinutes = await getTotalStudyMinutes();
    setStats({ pdfCount: pdfs.length, totalMinutes });
    
    // Ders ilerlemelerini kontrol et
    const progressMap: Record<string, number> = {};
    for (const course of COURSES) {
      progressMap[course.id] = await getProgress(course.id);
    }

    const courseAchievements: Achievement[] = COURSES.map(course => ({
      id: `course-${course.id}`,
      title: `${course.name} Nişanı`,
      description: `${course.featuredCharacter?.name} huzurunda dersini ikmal ettin.`,
      icon: course.icon,
      category: 'course',
      courseId: course.id,
      isUnlocked: progressMap[course.id] >= 100
    }));

    const generalAchievements: Achievement[] = [
      { 
        id: 'archival-1', 
        title: 'Hafız-ı Kütüb', 
        description: "Kütüphaneye 3'ten fazla ferman hıfzettin.", 
        icon: '📚', 
        category: 'archival', 
        isUnlocked: pdfs.length >= 3 
      },
      { 
        id: 'study-1', 
        title: 'Müverrih Sabrı', 
        description: "Toplam 60 dakika (1 saat) tedrisat yaptın.", 
        icon: '⏳', 
        category: 'academic', 
        isUnlocked: totalMinutes >= 60 
      },
      { 
        id: 'study-2', 
        title: 'Büyük Vakanüvis', 
        description: "Toplam 300 dakika (5 saat) derinlemesine araştırma yaptın.", 
        icon: '🖋️', 
        category: 'academic', 
        isUnlocked: totalMinutes >= 300 
      },
      { 
        id: 'social-1', 
        title: 'Meclis Reisi', 
        description: "Toplulukta aktif paylaşımlarda bulundun.", 
        icon: '🤝', 
        category: 'social', 
        isUnlocked: false // Bu özellik dbService üzerinden mesaj/kaynak sayısına bağlanabilir
      },
      { 
        id: 'academic-master', 
        title: 'Nişan-ı Zî-şân', 
        description: 'Tüm derslerde %100 muvaffakiyet sağladın.', 
        icon: '🏛️', 
        category: 'academic', 
        isUnlocked: Object.values(progressMap).every(p => p >= 100) 
      },
    ];

    setAchievements([...courseAchievements, ...generalAchievements]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const OttomanBadge = ({ ach }: { ach: Achievement }) => (
    <div className={`relative group flex flex-col items-center text-center transition-all duration-700 ${ach.isUnlocked ? 'scale-100' : 'scale-95 opacity-40 grayscale'}`}>
      {/* Altın Varrak Efekti (Arka Plan) */}
      {ach.isUnlocked && (
        <div className="absolute inset-0 bg-altin/10 blur-[50px] rounded-full scale-75 group-hover:scale-125 transition-transform duration-1000"></div>
      )}

      {/* Nişan / Rozet Gövdesi */}
      <div className={`relative w-32 h-32 sm:w-40 sm:h-40 mb-6 flex items-center justify-center transition-all duration-500 transform group-hover:rotate-[360deg] ${ach.isUnlocked ? 'drop-shadow-[0_15px_35px_rgba(212,175,55,0.4)]' : ''}`}>
        
        {/* Rumi Motifli Kenarlık (SVG) */}
        <svg className="absolute inset-0 w-full h-full text-altin animate-pulse-slow" viewBox="0 0 100 100">
           <defs>
             <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" style={{stopColor:'#d4af37', stopOpacity:1}} />
               <stop offset="50%" style={{stopColor:'#f9f295', stopOpacity:1}} />
               <stop offset="100%" style={{stopColor:'#b38728', stopOpacity:1}} />
             </linearGradient>
           </defs>
           {/* Ogee Arch Form */}
           <path 
             fill="url(#goldGrad)" 
             d="M50 5 L85 25 L85 75 L50 95 L15 75 L15 25 Z" 
             className="opacity-20"
           />
           {/* Border Path */}
           <path 
             fill="none" 
             stroke="url(#goldGrad)" 
             strokeWidth="3"
             d="M50 10 L80 28 L80 72 L50 90 L20 72 L20 28 Z"
           />
           {/* Inner Decorative Circle */}
           <circle cx="50" cy="50" r="35" fill="none" stroke="url(#goldGrad)" strokeWidth="1" strokeDasharray="2 4" />
        </svg>

        {/* Rozet İçeriği */}
        <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center border-4 ${ach.isUnlocked ? 'bg-hunkar border-altin shadow-inner' : 'bg-slate-200 border-slate-300'}`}>
           <span className={`text-4xl sm:text-5xl ${ach.isUnlocked ? 'filter-none' : 'brightness-50'}`}>
             {ach.icon}
           </span>
        </div>

        {/* Üst Püskül / Başlık Detail */}
        {ach.isUnlocked && (
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-altin text-hunkar px-4 py-1 rounded-md text-[8px] font-display font-black tracking-widest shadow-lg border border-white/20 whitespace-nowrap">
             BERAT-I ŞERİF
           </div>
        )}
      </div>

      {/* Metin Alanı */}
      <div className="relative z-10 px-4">
        <h3 className={`font-display font-bold text-sm sm:text-base tracking-widest mb-2 uppercase ${ach.isUnlocked ? 'text-hunkar dark:text-altin' : 'text-slate-400'}`}>
          {ach.title}
        </h3>
        <p className="text-[10px] sm:text-xs text-slate-600 dark:text-orange-50/60 font-serif italic leading-relaxed line-clamp-2 max-w-[140px] mx-auto">
          {ach.description}
        </p>
      </div>

      {/* Kilit Durumu Etiketi */}
      <div className="mt-5">
        {ach.isUnlocked ? (
          <div className="flex flex-col items-center animate-bounce-subtle">
             <span className="text-[9px] font-display font-black text-white uppercase tracking-widest bg-emerald-600 px-4 py-1.5 rounded-full border border-emerald-400 shadow-md">
               MUVAFFAR ✓
             </span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
             <span className="text-[9px] font-display font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
               KİLİTLİ 🔒
             </span>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 pb-safe">
      <div className="w-16 h-16 border-4 border-altin border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-8 text-hunkar dark:text-altin font-display tracking-[0.3em] uppercase text-sm animate-pulse">Hazine-i Enderun Açılıyor...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 pb-40">
      <div className="text-center mb-24 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-5 pointer-events-none -translate-y-16">
           <svg width="400" height="400" viewBox="0 0 100 100" fill="currentColor" className="text-hunkar dark:text-altin">
              <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
           </svg>
        </div>
        <div className="inline-block px-6 py-2 border-y-2 border-altin/30 mb-6">
           <span className="text-xs font-display font-bold text-enderun dark:text-altin/60 tracking-[0.5em] uppercase">Mükafat ve Mertebeler</span>
        </div>
        <h2 className="text-5xl sm:text-7xl font-display font-bold text-hunkar dark:text-altin tracking-widest uppercase mb-6 drop-shadow-md">Hazine-i Enderun</h2>
        <p className="text-enderun dark:text-orange-100/60 font-serif italic text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
          "İlim payesi, rütbelerin en yücesidir." Kazandığınız her nişan, akademik muvaffakiyetinizin birer mührüdür.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-16 gap-x-8">
        {achievements.map((ach) => (
          <OttomanBadge key={ach.id} ach={ach} />
        ))}
      </div>

      {/* Müverrihlik Karnesi / İstatistikler */}
      <div className="mt-32 p-10 sm:p-16 bg-hunkar dark:bg-orange-950/20 border-x-8 border-altin rounded-[4rem] shadow-2xl relative overflow-hidden rumi-border">
        <div className="absolute right-[-40px] top-[-40px] opacity-5 text-[300px] text-white pointer-events-none select-none rotate-12">🕌</div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h3 className="text-3xl sm:text-4xl font-display font-bold text-altin mb-6 uppercase tracking-widest drop-shadow-sm">Müverrihlik Mertebesi</h3>
            <p className="text-orange-50 font-serif italic text-lg sm:text-xl leading-relaxed opacity-80 max-w-2xl">
              Tedrisat sürecinizde şu ana kadar <b>{stats.pdfCount} ferman</b> hıfzettiniz ve <b>{stats.totalMinutes} dakika</b> mütalaa yaptınız. Mertebeniz: 
              <span className="text-altin font-bold ml-2">
                {stats.totalMinutes > 500 ? "Vakanüvis-i Evvel" : stats.totalMinutes > 100 ? "Müderris" : "Talebe-i Ulum"}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-10 sm:gap-16">
            <div className="text-center group">
              <div className="text-5xl sm:text-6xl font-display font-bold text-altin mb-3 group-hover:scale-110 transition-transform">{achievements.filter(a => a.isUnlocked).length}</div>
              <div className="text-[10px] font-display font-black text-orange-200 uppercase tracking-[0.3em]">KAZANILAN NİŞAN</div>
            </div>
            <div className="text-center group">
              <div className="text-5xl sm:text-6xl font-display font-bold text-altin mb-3 group-hover:scale-110 transition-transform">{stats.totalMinutes}</div>
              <div className="text-[10px] font-display font-black text-orange-200 uppercase tracking-[0.3em]">TOPLAM DAKİKA</div>
            </div>
            <div className="text-center group">
              <div className="text-5xl sm:text-6xl font-display font-bold text-altin mb-3 group-hover:scale-110 transition-transform">{stats.pdfCount}</div>
              <div className="text-[10px] font-display font-black text-orange-200 uppercase tracking-[0.3em]">KİTAP / FERMAN</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; stroke-width: 3; }
          50% { opacity: 1; stroke-width: 4; }
        }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default AchievementsView;
