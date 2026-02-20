
import React, { useState } from 'react';
import { Course } from '../types';
import HistoricalDuel from './games/HistoricalDuel';
import TreasureHunt from './games/TreasureHunt';
import WhatIfScenarios from './games/WhatIfScenarios';
import HistoryWheel from './games/HistoryWheel';
import CollectionCards from './games/CollectionCards';

interface GamesHubProps {
  course: Course;
  selectedUnit: number;
}

type GameType = 'hub' | 'duel' | 'treasure' | 'whatif' | 'wheel' | 'collection';

const GamesHub: React.FC<GamesHubProps> = ({ course, selectedUnit }) => {
  const [activeGame, setActiveGame] = useState<GameType>('hub');

  const renderGame = () => {
    switch (activeGame) {
      case 'duel': return <HistoricalDuel course={course} selectedUnit={selectedUnit} onBack={() => setActiveGame('hub')} />;
      case 'treasure': return <TreasureHunt course={course} selectedUnit={selectedUnit} onBack={() => setActiveGame('hub')} />;
      case 'whatif': return <WhatIfScenarios course={course} selectedUnit={selectedUnit} onBack={() => setActiveGame('hub')} />;
      case 'wheel': return <HistoryWheel course={course} selectedUnit={selectedUnit} onBack={() => setActiveGame('hub')} />;
      case 'collection': return <CollectionCards course={course} selectedUnit={selectedUnit} onBack={() => setActiveGame('hub')} />;
      default: return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          <button 
            onClick={() => setActiveGame('duel')}
            className="group bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-4 border-altin/20 hover:border-altin transition-all shadow-xl text-center flex flex-col items-center gap-4"
          >
            <div className="text-6xl group-hover:scale-110 transition-transform">⚔️</div>
            <h3 className="text-xl font-display font-black text-hunkar dark:text-altin uppercase tracking-widest">Tarihsel Düello</h3>
            <p className="text-xs text-slate-500 font-serif italic">Tarihi şahsiyetlerle bilgi yarışına gir.</p>
          </button>

          <button 
            onClick={() => setActiveGame('treasure')}
            className="group bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-4 border-altin/20 hover:border-altin transition-all shadow-xl text-center flex flex-col items-center gap-4"
          >
            <div className="text-6xl group-hover:scale-110 transition-transform">🗺️</div>
            <h3 className="text-xl font-display font-black text-hunkar dark:text-altin uppercase tracking-widest">Hazine Avı</h3>
            <p className="text-xs text-slate-500 font-serif italic">Fasıl metnindeki gizli bilgileri bul.</p>
          </button>

          <button 
            onClick={() => setActiveGame('whatif')}
            className="group bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-4 border-altin/20 hover:border-altin transition-all shadow-xl text-center flex flex-col items-center gap-4"
          >
            <div className="text-6xl group-hover:scale-110 transition-transform">🎭</div>
            <h3 className="text-xl font-display font-black text-hunkar dark:text-altin uppercase tracking-widest">Vaka-i Hayal</h3>
            <p className="text-xs text-slate-500 font-serif italic">Tarih farklı aksaydı ne olurdu?</p>
          </button>

          <button 
            onClick={() => setActiveGame('wheel')}
            className="group bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-4 border-altin/20 hover:border-altin transition-all shadow-xl text-center flex flex-col items-center gap-4"
          >
            <div className="text-6xl group-hover:scale-110 transition-transform">🎡</div>
            <h3 className="text-xl font-display font-black text-hunkar dark:text-altin uppercase tracking-widest">Felek-i Tarih</h3>
            <p className="text-xs text-slate-500 font-serif italic">Tarih çarkını çevir, kısmetine ne çıkacak?</p>
          </button>

          <button 
            onClick={() => setActiveGame('collection')}
            className="group bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-4 border-altin/20 hover:border-altin transition-all shadow-xl text-center flex flex-col items-center gap-4"
          >
            <div className="text-6xl group-hover:scale-110 transition-transform">💎</div>
            <h3 className="text-xl font-display font-black text-hunkar dark:text-altin uppercase tracking-widest">Hazine-i Enderun</h3>
            <p className="text-xs text-slate-500 font-serif italic">Nadir koleksiyon kartlarını topla.</p>
          </button>
        </div>
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-hunkar p-8 rounded-[3rem] border-4 border-altin shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-altin/10 rounded-bl-full -mr-8 -mt-8"></div>
        <div className="relative z-10 text-center sm:text-left">
          <h2 className="text-2xl font-display font-black text-altin tracking-widest uppercase mb-2">DARÜ'L-EĞLENCE (OYUN MERKEZİ)</h2>
          <p className="text-orange-50/70 font-serif italic text-sm">
            İlmi, eğlence ile meczederek hıfz et. {course.name} - {selectedUnit}. Ünite
          </p>
        </div>
      </div>
      {renderGame()}
    </div>
  );
};

export default GamesHub;
