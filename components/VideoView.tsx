
import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { getCourseVideoUrl, saveCourseVideoUrl, deleteCourseVideoUrl } from '../services/dbService';

interface VideoViewProps {
  course: Course;
}

const VideoView: React.FC<VideoViewProps> = ({ course }) => {
  const [activeUrl, setActiveUrl] = useState<string>(course.videoUrl || "");
  const [isEditing, setIsEditing] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomUrl();
  }, [course.id]);

  const fetchCustomUrl = async () => {
    setLoading(true);
    const custom = await getCourseVideoUrl(course.id);
    if (custom) {
      setActiveUrl(custom);
      setNewUrl(custom);
    } else {
      setActiveUrl(course.videoUrl || "");
      setNewUrl(course.videoUrl || "");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!newUrl.trim()) return;
    
    // YouTube linkini embed formatına dönüştürme denemesi (isteğe bağlı ama faydalı)
    let finalUrl = newUrl;
    if (newUrl.includes("youtube.com/watch?v=")) {
        const id = newUrl.split("v=")[1]?.split("&")[0];
        finalUrl = `https://www.youtube.com/embed/${id}`;
    } else if (newUrl.includes("youtu.be/")) {
        const id = newUrl.split("youtu.be/")[1]?.split("?")[0];
        finalUrl = `https://www.youtube.com/embed/${id}`;
    }

    await saveCourseVideoUrl(course.id, finalUrl);
    setActiveUrl(finalUrl);
    setIsEditing(false);
  };

  const handleReset = async () => {
    if (window.confirm("Kayıt linkini aslına (AUZEF resmi linkine) döndürmek istediğinize emin misiniz?")) {
      await deleteCourseVideoUrl(course.id);
      setActiveUrl(course.videoUrl || "");
      setNewUrl(course.videoUrl || "");
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-altin border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-white/90 dark:bg-black/40 p-6 sm:p-10 rounded-[3rem] shadow-2xl border-x-8 border-altin/20 relative overflow-hidden rumi-border">
        <div className="absolute top-0 left-0 w-full h-4 bg-hunkar"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display text-hunkar dark:text-altin tracking-widest uppercase mb-2">Tedrisat Kaydı</h2>
            <p className="text-slate-500 dark:text-orange-100/40 font-serif italic text-sm">"{course.name}" dersi görüntülü mütalaası.</p>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="bg-altin/20 text-hunkar dark:text-altin px-5 py-2 rounded-full border border-altin/40 text-[10px] font-display font-black tracking-widest hover:bg-altin/40 transition-all"
          >
            {isEditing ? "❌ VAZGEÇ" : "📜 KAYDI TAHRİR ET"}
          </button>
        </div>

        {isEditing && (
          <div className="mb-8 p-6 bg-parshmen dark:bg-slate-900/60 rounded-3xl border-2 border-altin/30 animate-in zoom-in-95">
            <label className="block text-[10px] font-display font-black text-hunkar dark:text-altin mb-3 uppercase tracking-widest">Yeni Video / Oynatma Listesi Linki</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="YouTube embed veya normal video linki..."
                className="flex-1 bg-white dark:bg-slate-800 border-2 border-altin/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-altin transition-all dark:text-white"
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  className="bg-hunkar text-altin px-6 py-3 rounded-xl font-display font-bold text-[10px] tracking-widest shadow-lg hover:brightness-110"
                >
                  HIFZET
                </button>
                <button 
                  onClick={handleReset}
                  className="bg-white dark:bg-slate-800 text-rose-600 px-4 py-3 rounded-xl font-display font-bold text-[10px] tracking-widest border border-rose-200"
                >
                  ASLINA DÖN
                </button>
              </div>
            </div>
            <p className="mt-3 text-[9px] text-slate-400 font-serif italic">Not: Normal YouTube linkleri otomatik olarak mütalaa moduna (embed) çevrilecektir.</p>
          </div>
        )}

        {activeUrl ? (
          <div className="aspect-video w-full rounded-[2rem] overflow-hidden border-4 border-altin shadow-2xl bg-black">
            <iframe 
              src={activeUrl} 
              title={`${course.name} Video Dersi`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="aspect-video w-full rounded-[2rem] border-4 border-dashed border-altin/30 flex flex-col items-center justify-center text-center p-8 bg-parshmen/30 dark:bg-slate-900/40">
            <div className="text-6xl mb-4 grayscale opacity-40">🎥</div>
            <h3 className="text-xl font-display font-bold text-hunkar dark:text-altin uppercase">Görüntü Bulunamadı</h3>
            <p className="text-slate-500 dark:text-slate-400 font-serif italic mt-2">Bu ders için henüz bir görüntü kaydı hıfzedilmemiş.</p>
          </div>
        )}

        <div className="mt-10 p-6 bg-hunkar/5 dark:bg-altin/5 rounded-3xl border border-altin/20">
          <h4 className="text-sm font-display font-black text-hunkar dark:text-altin uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>🎓</span> Akademik Not
          </h4>
          <p className="text-sm text-slate-700 dark:text-orange-50/70 font-serif italic leading-relaxed">
            Video dersleri izlerken "Hülasa" kısmındaki notlarınızı açık tutmanız, duyduğunuz mühim tarihleri anında tahrir etmeniz (yazmanız) hıfız sürecini hızlandıracaktır. Bu videolar AUZEF'in resmi müfredat kayıtlarıdır.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a 
          href={`https://www.youtube.com/results?search_query=auzef+${course.name.replace(' ', '+')}`} 
          target="_blank" 
          rel="noreferrer"
          className="bg-hunkar text-altin p-6 rounded-[2rem] border-2 border-altin flex items-center justify-between hover:brightness-110 transition-all group"
        >
          <div className="font-display font-bold text-xs tracking-widest uppercase">YouTube'da Ara ↗</div>
          <div className="text-2xl group-hover:scale-125 transition-transform">🔍</div>
        </a>
        <div className="bg-altin text-hunkar p-6 rounded-[2rem] border-2 border-hunkar flex items-center justify-between">
          <div className="font-display font-bold text-xs tracking-widest uppercase">Ders Kaydı Modu</div>
          <div className="text-2xl">📽️</div>
        </div>
      </div>
    </div>
  );
};

export default VideoView;
