
import React, { useState, useEffect } from 'react';
import { User, WeeklyPlan, StudySession, DayAvailability } from '../types';
import { generateWeeklyPlan } from '../services/geminiService';
import { COURSES } from '../constants';

interface WeeklyPlannerProps {
  user: User;
  onBack: () => void;
}

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const TIME_OPTIONS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
  "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
];

const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({ user, onBack }) => {
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [availability, setAvailability] = useState<DayAvailability[]>(
    DAYS.map(day => ({ day, slots: [] }))
  );

  useEffect(() => {
    const savedPlan = localStorage.getItem('weekly_study_plan');
    if (savedPlan) {
      setPlan(JSON.parse(savedPlan));
    }
  }, []);

  const toggleSlot = (dayName: string, slot: string) => {
    setAvailability(prev => prev.map(a => {
      if (a.day === dayName) {
        const slots = a.slots.includes(slot) 
          ? a.slots.filter(s => s !== slot)
          : [...a.slots, slot].sort();
        return { ...a, slots };
      }
      return a;
    }));
  };

  const handleGenerate = async () => {
    const hasAnySlot = availability.some(a => a.slots.length > 0);
    if (!hasAnySlot) {
      alert("Lütfen en az bir çalışma saati seçin.");
      return;
    }

    setLoading(true);
    setIsConfiguring(false);
    try {
      const courseNames = COURSES.map(c => c.name);
      const data = await generateWeeklyPlan(user.name, courseNames, availability);
      setPlan(data);
      localStorage.setItem('weekly_study_plan', JSON.stringify(data));
    } catch (error) {
      console.error("Plan oluşturma hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToGoogleCalendar = (session: StudySession) => {
    const title = `Çalışma: ${session.courseName}`;
    const details = `Konu: ${session.topic}\nTür: ${session.type === 'focus' ? 'Odaklanma' : session.type === 'review' ? 'Tekrar' : 'Soru Çözümü'}\nSüre: ${session.duration}`;
    const baseUrl = "https://www.google.com/calendar/render?action=TEMPLATE";
    const encodedTitle = encodeURIComponent(title);
    const encodedDetails = encodeURIComponent(details);
    const calendarUrl = `${baseUrl}&text=${encodedTitle}&details=${encodedDetails}`;
    window.open(calendarUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="py-24 text-center animate-in fade-in duration-500 pb-safe">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-slate-500 font-serif italic text-lg animate-pulse">
          Seçtiğin saatlere göre en verimli program hazırlanıyor...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 px-4 animate-in fade-in slide-in-from-bottom-6 duration-500 pb-safe">
      <div className="flex items-center justify-between mb-8 sm:mb-10">
        <button onClick={onBack} className="text-slate-400 dark:text-slate-500 font-bold hover:text-slate-900 dark:hover:text-white flex items-center gap-2 group p-2">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Geri
        </button>
        <h2 className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white">Haftalık Planlayıcı</h2>
      </div>

      {isConfiguring || (!plan && !loading) ? (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="text-center mb-6 sm:mb-8">
            <span className="text-3xl sm:text-4xl mb-4 block">⏰</span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">Çalışma Saatlerini Belirle</h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-2 px-4">Yapay zeka programını bu saatlere göre optimize edecek.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
            {availability.map((a) => (
              <div key={a.day} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl">
                <h4 className="font-bold text-indigo-600 mb-3 text-xs sm:text-sm uppercase tracking-wider">{a.day}</h4>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 gap-2">
                  {TIME_OPTIONS.map(time => (
                    <button
                      key={time}
                      onClick={() => toggleSlot(a.day, time)}
                      className={`py-2.5 rounded-lg text-[10px] sm:text-[11px] font-black transition-all active:scale-95 ${
                        a.slots.includes(time)
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {plan && (
              <button 
                onClick={() => setIsConfiguring(false)}
                className="px-8 py-4 text-slate-400 font-bold uppercase text-xs"
              >
                İptal Et
              </button>
            )}
            <button 
              onClick={handleGenerate}
              className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              {plan ? "Planı Güncelle" : "Programımı Oluştur"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          <div className="bg-indigo-900 text-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-start relative z-10">
               <div>
                <h3 className="text-lg sm:text-xl font-serif font-bold mb-2 flex items-center gap-3">
                  <span>🎯</span> AI Tavsiyesi
                </h3>
                <p className="text-indigo-100 text-xs sm:text-sm italic opacity-90 leading-relaxed max-w-2xl">
                  "{plan?.advice}"
                </p>
               </div>
               <button 
                onClick={() => setIsConfiguring(true)}
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-all active:scale-90"
               >
                 ⚙️
               </button>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-[100px] sm:text-[150px] rotate-12">💡</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {DAYS.map(day => {
              const daySessions = plan?.sessions.filter(s => s.day.toLowerCase() === day.toLowerCase());
              return (
                <div key={day} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-50 dark:border-slate-800 pb-2">
                    <h4 className="font-serif font-black text-indigo-600 dark:text-indigo-400">{day}</h4>
                    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{daySessions?.length || 0} Oturum</span>
                  </div>
                  
                  <div className="space-y-3">
                    {!daySessions || daySessions.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic py-4">Ders atanmadı.</p>
                    ) : (
                      daySessions.map((session, i) => (
                        <div key={i} className="group p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black text-indigo-500 uppercase">{session.time}</span>
                            <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${
                              session.type === 'focus' ? 'bg-rose-100 text-rose-600' : 
                              session.type === 'review' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                              {session.type}
                            </span>
                          </div>
                          <h5 className="text-sm font-bold text-slate-800 dark:text-white mb-1 leading-tight">{session.courseName}</h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-tight">{session.topic}</p>
                          <button 
                            onClick={() => addToGoogleCalendar(session)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-3 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-300 active:bg-slate-900 active:text-white transition-all shadow-sm"
                          >
                            📅 Takvime Ekle
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-8">
            <button 
              onClick={() => setIsConfiguring(true)}
              className="text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline p-4"
            >
              🔄 Ayarları Yenile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyPlanner;