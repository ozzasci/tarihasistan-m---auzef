
import React from 'react';
import { Achievement } from '../types';

const ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'İlk Adım', description: 'Bir dersin özetini tamamladın.', icon: '📜', requirement: 'summary', isUnlocked: true },
  { id: '2', title: 'Bilge Öğrenci', description: 'Bir sınavdan tam puan aldın.', icon: '🦉', requirement: 'quiz_perfect', isUnlocked: false },
  { id: '3', title: 'Zaman Yolcusu', description: 'Bir tarihi karakterle mülakat yaptın.', icon: '⏳', requirement: 'interview', isUnlocked: true },
  { id: '4', title: 'Arşiv Uzmanı', description: 'İlk PDF kitabını kütüphaneye ekledin.', icon: '🏛️', requirement: 'upload', isUnlocked: true },
  { id: '5', title: 'Bozkırın Hakimi', description: 'Altınorda ve Türkistan derslerini bitirdin.', icon: '🏇', requirement: 'course_master', isUnlocked: false },
];

const AchievementsView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-serif font-bold text-slate-900">Başarılar ve Rozetler</h2>
        <p className="text-slate-500 mt-2">Akademik kariyerindeki kilometre taşlarını takip et.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ACHIEVEMENTS.map((ach) => (
          <div 
            key={ach.id}
            className={`p-8 rounded-[2.5rem] border-2 transition-all ${ach.isUnlocked ? 'bg-white border-indigo-100 shadow-xl' : 'bg-slate-50 border-transparent grayscale opacity-50'}`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg ${ach.isUnlocked ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
              {ach.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{ach.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">{ach.description}</p>
            {ach.isUnlocked ? (
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Açıldı ✓</span>
            ) : (
              <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">Kilitli</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementsView;
