
import React, { useState, useEffect } from 'react';
import { addStudyTime } from '../services/dbService';

const StudyTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [initialTime] = useState(25 * 60);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      
      // Çalışma süresi bittiyse istatistiklere ekle
      if (mode === 'study') {
        const minutesEarned = Math.floor(initialTime / 60);
        addStudyTime(minutesEarned);
      }

      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      audio.play().catch(() => {});
      alert(mode === 'study' ? "Çalışma süresi bitti! Mola ver. Nişanların için dakikalar hanene eklendi." : "Mola bitti! Haydi derse.");
      handleReset();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggle = () => setIsActive(!isActive);
  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-slate-900 rounded-[2rem] p-6 text-white flex items-center justify-between shadow-2xl border border-white/10">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${isActive ? 'bg-amber-500 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-white/10'}`}>
          {mode === 'study' ? '⏳' : '☕'}
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{mode === 'study' ? 'Odaklanma' : 'Mola'}</div>
          <div className="text-2xl font-mono font-bold">{formatTime(timeLeft)}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={toggle}
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${isActive ? 'bg-rose-500' : 'bg-emerald-500 shadow-lg shadow-emerald-500/20'}`}
        >
          {isActive ? '⏸' : '▶'}
        </button>
        <button 
          onClick={handleReset}
          className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold hover:bg-white/20 transition-all"
        >
          🔄
        </button>
      </div>
    </div>
  );
};

export default StudyTimer;
