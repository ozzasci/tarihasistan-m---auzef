
import React, { useEffect, useState, useRef } from 'react';
import { User } from '../types';
import { logoutUser, getProgress, updateUser } from '../services/dbService';
import { COURSES } from '../constants';

interface ProfileViewProps {
  user: User;
  onUpdate: (user: User) => void;
  onLogout: () => void;
  onBack: () => void;
  onNavigateToSettings?: () => void; // Optional if needed locally
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdate, onLogout, onBack }) => {
  const [totalProgress, setTotalProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      let total = 0;
      for (const course of COURSES) {
        const p = await getProgress(course.id);
        total += p;
      }
      setTotalProgress(Math.round(total / COURSES.length));
    };
    fetchProgress();
  }, []);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const updatedUser = { ...user, avatarUrl: base64String };
      try {
        await updateUser(updatedUser);
        onUpdate(updatedUser);
      } catch (err) {
        alert("Fotoğraf güncellenirken bir hata oluştu.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="text-slate-400 dark:text-slate-500 font-bold hover:text-slate-900 dark:hover:text-white flex items-center gap-2 group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Geri Dön
        </button>
        <button 
          onClick={() => { logoutUser(); onLogout(); }}
          className="text-rose-500 font-black text-xs uppercase tracking-widest bg-rose-50 dark:bg-rose-950/30 px-5 py-2.5 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
        >
          Çıkış Yap
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
             
             <div className="relative inline-block group mb-6">
               <div className="w-28 h-28 bg-slate-900 dark:bg-slate-800 text-white rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto shadow-2xl overflow-hidden border-4 border-white dark:border-slate-700">
                 {user.avatarUrl ? (
                   <img src={user.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                 ) : (
                   user.name.charAt(0)
                 )}
               </div>
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 group-hover:scale-110 transition-transform"
               >
                 {isUploading ? "⏳" : "📸"}
               </button>
               <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                className="hidden" 
                accept="image/*" 
               />
             </div>

             <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">{user.name}</h2>
             <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{user.email}</p>
             <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
               <span className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Öğrenci No</span>
               <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{user.studentNo || "Belirtilmemiş"}</span>
             </div>
          </div>

          <div className="bg-indigo-900 dark:bg-slate-800 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <h3 className="text-lg font-bold mb-4 relative z-10">Genel İlerleme</h3>
            <div className="text-5xl font-black mb-4 relative z-10">%{totalProgress}</div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-amber-400" style={{ width: `${totalProgress}%` }}></div>
            </div>
            <p className="text-xs text-indigo-200 dark:text-slate-400 leading-relaxed opacity-80">
              3. Sınıf müfredatındaki 6 temel dersin ortalama tamamlanma oranı.
            </p>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-9xl">📈</div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-6">Akademik Karnem</h3>
            <div className="space-y-4">
              {COURSES.map(course => (
                <CourseProgressRow key={course.id} course={course} />
              ))}
            </div>
          </div>

          <div className="bg-hunkar text-altin p-8 rounded-[3rem] border-4 border-altin shadow-2xl relative overflow-hidden">
            <h3 className="text-xl font-display font-black mb-6 flex items-center gap-3">
              <span className="text-2xl">📜</span> Müverrih'in Tedrisat Tavsiyeleri
            </h3>
            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-white/10 rounded-2xl border border-altin/20">
                <h4 className="text-xs font-black uppercase tracking-widest mb-1">1. Usul-i Mütalaa</h4>
                <p className="text-[10px] font-serif italic opacity-80">Fasıl metnini okumadan önce "Hülasa" kısmına göz atarak ana iskeleti kavrayın.</p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl border border-altin/20">
                <h4 className="text-xs font-black uppercase tracking-widest mb-1">2. Hıfz-ı Kelimat</h4>
                <p className="text-[10px] font-serif italic opacity-80">Akademik terminoloji için "Lügatçe"yi her gün 5 dakika mütalaa edin.</p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl border border-altin/20">
                <h4 className="text-xs font-black uppercase tracking-widest mb-1">3. Vaka-i Oyun</h4>
                <p className="text-[10px] font-serif italic opacity-80">Zihniniz yorulduğunda "Darü'l-Eğlence"ye uğrayarak bilgilerinizi tazeleyin.</p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl border border-altin/20">
                <h4 className="text-xs font-black uppercase tracking-widest mb-1">4. Keşf-i Sual</h4>
                <p className="text-[10px] font-serif italic opacity-80">Sınavdan bir hafta önce "Keşf-i Sual" tahminlerini mutlaka inceleyin.</p>
              </div>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-[140px] rotate-12">🖋️</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fix: Added React.FC type to handle the reserved 'key' prop correctly in TSX
const CourseProgressRow: React.FC<{ course: any }> = ({ course }) => {
  const [prog, setProg] = useState(0);
  useEffect(() => { getProgress(course.id).then(setProg); }, [course.id]);

  return (
    <div className="flex items-center gap-4 group">
      <div className={`w-12 h-12 rounded-xl ${course.color} flex items-center justify-center text-xl shrink-0 shadow-sm`}>
        {course.icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{course.name}</span>
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500">%{prog}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-100 dark:border-slate-700">
          <div className={`h-full ${course.color} transition-all duration-1000`} style={{ width: `${prog}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
