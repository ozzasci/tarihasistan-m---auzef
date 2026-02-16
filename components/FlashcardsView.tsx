
import React, { useState, useEffect } from 'react';
import { Course, Flashcard } from '../types';
import { generateFlashcards } from '../services/geminiService';

interface FlashcardsViewProps {
  course: Course;
}

const FlashcardsView: React.FC<FlashcardsViewProps> = ({ course }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        const data = await generateFlashcards(course.name);
        setCards(data);
      } catch (error) {
        console.error("Kartlar yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [course]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-slate-500 font-serif italic">Ezber kartları hazırlanıyor...</p>
      </div>
    );
  }

  if (cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-md mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center px-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kart {currentIndex + 1} / {cards.length}</span>
        <button 
          onClick={() => { setCurrentIndex(0); setIsFlipped(false); }}
          className="text-xs font-bold text-amber-600 hover:underline"
        >
          Sıfırla
        </button>
      </div>

      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative w-full h-80 cursor-pointer group perspective-1000"
      >
        <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white rounded-[2.5rem] shadow-xl border-2 border-slate-100 flex flex-col items-center justify-center p-8 text-center">
            <div className="text-4xl mb-6 opacity-20">❓</div>
            <h3 className="text-xl font-serif font-bold text-slate-900 leading-relaxed">
              {currentCard.front}
            </h3>
            <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Çevirmek için tıkla</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-amber-50 rounded-[2.5rem] shadow-xl border-2 border-amber-200 flex flex-col items-center justify-center p-8 text-center">
            <div className="text-4xl mb-6 opacity-20">💡</div>
            <p className="text-lg font-medium text-amber-900 leading-relaxed">
              {currentCard.back}
            </p>
            <div className="mt-8 w-12 h-1.5 bg-amber-200 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          disabled={currentIndex === 0}
          onClick={() => { setCurrentIndex(prev => prev - 1); setIsFlipped(false); }}
          className="flex-1 bg-white border border-slate-200 text-slate-600 py-4 rounded-2xl font-bold disabled:opacity-30 active:scale-95 transition-all shadow-sm"
        >
          ← Önceki
        </button>
        <button
          disabled={currentIndex === cards.length - 1}
          onClick={() => { setCurrentIndex(prev => prev + 1); setIsFlipped(false); }}
          className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold disabled:opacity-30 active:scale-95 transition-all shadow-lg"
        >
          Sonraki →
        </button>
      </div>

      <div className="bg-white/50 p-6 rounded-3xl border border-slate-100">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Çalışma İpucu</h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          Aktif geri çağırma (active recall) yöntemiyle öğrenmek için cevabı görmeden önce zihninde canlandırmaya çalış.
        </p>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180px); }
      `}</style>
    </div>
  );
};

export default FlashcardsView;
