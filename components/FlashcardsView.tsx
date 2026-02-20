
import React, { useState, useEffect } from 'react';
import { Course, Flashcard } from '../types';
import { extractFlashcardsFromPDF } from '../services/geminiService';
import { getUnitPDF, saveFlashcards, getFlashcards } from '../services/dbService';
import { blobToBase64 } from '../services/pdfService';

interface FlashcardsViewProps {
  course: Course;
  selectedUnit: number;
}

const FlashcardsView: React.FC<FlashcardsViewProps> = ({ course, selectedUnit }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [hasPdf, setHasPdf] = useState(false);

  useEffect(() => {
    loadCards();
    checkPdf();
  }, [course.id, selectedUnit]);

  const checkPdf = async () => {
    const pdf = await getUnitPDF(course.id, selectedUnit);
    setHasPdf(!!pdf);
  };

  const loadCards = async () => {
    setLoading(true);
    try {
      const saved = await getFlashcards(course.id, selectedUnit);
      if (saved && saved.length > 0) {
        setCards(saved);
      } else {
        setCards([]);
      }
    } catch (error) {
      console.error("Kartlar yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async () => {
    setIsExtracting(true);
    try {
      const pdfBlob = await getUnitPDF(course.id, selectedUnit);
      if (!pdfBlob) {
        alert("Fasıl PDF'i bulunamadı.");
        return;
      }

      const base64 = await blobToBase64(pdfBlob);
      const extractedCards = await extractFlashcardsFromPDF(course.name, base64);
      
      if (extractedCards && extractedCards.length > 0) {
        setCards(extractedCards);
        await saveFlashcards(course.id, selectedUnit, extractedCards);
        setCurrentIndex(0);
        setIsFlipped(false);
      } else {
        alert("Kartlar oluşturulamadı.");
      }
    } catch (error) {
      console.error("Kart çıkarma hatası:", error);
      alert("Ezber kartları oluşturulurken bir hata oluştu.");
    } finally {
      setIsExtracting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-14 h-14 border-4 border-altin border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-slate-500 font-serif italic">Ezber kartları yükleniyor...</p>
      </div>
    );
  }

  if (cards.length === 0 && !isExtracting) {
    return (
      <div className="max-w-md mx-auto py-20 text-center animate-in fade-in duration-500">
        <div className="text-7xl mb-8 opacity-20">🗂️</div>
        <h3 className="text-2xl font-display font-bold text-hunkar dark:text-altin uppercase tracking-widest mb-4">Kart Mahzeni Boş</h3>
        <p className="text-slate-500 text-sm mb-10 font-serif italic leading-relaxed">
          Müverrih Oğuz, bu ünite için henüz ezber kartı oluşturulmamış. 
          {hasPdf ? "Fasıl PDF'inden otomatik olarak kart üretmek için aşağıdaki butonu kullanabilirsin." : "Lütfen önce ünite PDF'ini yükle."}
        </p>
        {hasPdf && (
          <button 
            onClick={handleExtract}
            className="bg-hunkar text-altin px-10 py-4 rounded-full font-display font-black text-sm shadow-xl border-2 border-altin active:scale-95 transition-all hover:brightness-110"
          >
            📄 FASILDAN KART ÜRET
          </button>
        )}
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-md mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="flex justify-between items-center px-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kart {currentIndex + 1} / {cards.length}</span>
          <span className="text-[8px] text-altin font-serif italic">{course.name}</span>
        </div>
        <div className="flex gap-3">
          {hasPdf && (
            <button 
              onClick={handleExtract}
              disabled={isExtracting}
              className="text-[10px] font-bold text-hunkar dark:text-altin hover:underline disabled:opacity-30"
            >
              {isExtracting ? "Üretiliyor..." : "Yenile"}
            </button>
          )}
          <button 
            onClick={() => { setCurrentIndex(0); setIsFlipped(false); }}
            className="text-[10px] font-bold text-slate-400 hover:underline"
          >
            Sıfırla
          </button>
        </div>
      </div>

      {isExtracting ? (
        <div className="w-full h-80 bg-white/50 dark:bg-slate-900/50 rounded-[2.5rem] border-4 border-dashed border-altin/20 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-12 h-12 border-4 border-hunkar border-t-transparent rounded-full animate-spin mb-6"></div>
          <h4 className="font-display font-bold text-hunkar dark:text-altin uppercase tracking-widest animate-pulse">Asistan Faslı Tarıyor...</h4>
          <p className="mt-4 text-xs text-slate-500 font-serif italic">En az 20 adet akademik kart üretiliyor.</p>
        </div>
      ) : (
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative w-full h-80 cursor-pointer group perspective-1000"
        >
          <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-2 border-altin/10 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-hunkar"></div>
              <div className="text-4xl mb-6 opacity-20">❓</div>
              <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentCard?.front}
              </h3>
              <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Çevirmek için tıkla</p>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-parshmen dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border-2 border-altin flex flex-col items-center justify-center p-8 text-center overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-altin"></div>
              <div className="text-4xl mb-6 opacity-20">💡</div>
              <p className="text-lg font-medium text-hunkar dark:text-orange-50 leading-relaxed">
                {currentCard?.back}
              </p>
              <div className="mt-8 w-12 h-1.5 bg-altin rounded-full"></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          disabled={currentIndex === 0 || isExtracting}
          onClick={() => { setCurrentIndex(prev => prev - 1); setIsFlipped(false); }}
          className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-bold disabled:opacity-30 active:scale-95 transition-all shadow-sm"
        >
          ← Önceki
        </button>
        <button
          disabled={currentIndex === cards.length - 1 || isExtracting}
          onClick={() => { setCurrentIndex(prev => prev + 1); setIsFlipped(false); }}
          className="flex-1 bg-hunkar text-altin py-4 rounded-2xl font-display font-black text-xs tracking-widest disabled:opacity-30 active:scale-95 transition-all shadow-lg border-2 border-altin"
        >
          Sonraki →
        </button>
      </div>

      <div className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-3xl border-2 border-dashed border-altin/10">
        <h4 className="text-[10px] font-bold text-hunkar dark:text-altin uppercase tracking-widest mb-2">Vakanüvis İpucu</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-serif italic">
          "Hıfz-ı ilim, tekrar ile kaimdir." Cevabı görmeden evvel zihninde AUZEF ders notlarını canlandırmaya gayret et.
        </p>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default FlashcardsView;

