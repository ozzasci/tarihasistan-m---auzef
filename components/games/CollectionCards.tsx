
import React, { useState, useEffect } from 'react';
import { Course, CollectionCard } from '../../types';
import { generateCollectionCards } from '../../services/geminiService';
import { getUnitPDF, saveCollectionCards, getCollectionCards } from '../../services/dbService';
import { blobToBase64 } from '../../services/pdfService';

interface CollectionCardsProps {
  course: Course;
  selectedUnit: number;
  onBack: () => void;
}

const CollectionCards: React.FC<CollectionCardsProps> = ({ course, selectedUnit, onBack }) => {
  const [cards, setCards] = useState<CollectionCard[]>([]);
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
      const saved = await getCollectionCards(course.id, selectedUnit);
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
        alert("Lütfen önce fasıl PDF'ini yükle.");
        onBack();
        return;
      }
      const base64 = await blobToBase64(pdfBlob);
      const data = await generateCollectionCards(course.name, base64);
      setCards(data);
      await saveCollectionCards(course.id, selectedUnit, data);
    } catch (error) {
      console.error("Kart çıkarma hatası:", error);
    } finally {
      setIsExtracting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-altin shadow-xl">
        <div className="w-16 h-16 border-4 border-hunkar border-t-transparent rounded-full animate-spin mb-8"></div>
        <h4 className="font-display font-bold text-hunkar dark:text-altin uppercase tracking-widest animate-pulse">Hazine-i Enderun Açılıyor...</h4>
      </div>
    );
  }

  if (cards.length === 0 && !isExtracting) {
    return (
      <div className="py-12 px-8 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-altin shadow-xl text-center space-y-8">
        <div className="text-7xl">💎</div>
        <h2 className="text-2xl font-display font-black text-hunkar dark:text-altin uppercase tracking-widest">Hazine-i Enderun</h2>
        <p className="text-slate-500 font-serif italic max-w-md mx-auto">
          Fasıl metnindeki mühim şahsiyetleri ve olayları nadir koleksiyon kartlarına dönüştür. Kendi tarihsel desteni oluştur.
        </p>
        {hasPdf && (
          <button onClick={handleExtract} className="bg-hunkar text-altin px-12 py-5 rounded-full font-display font-black text-sm tracking-widest border-2 border-altin shadow-xl active:scale-95 transition-all">KARTLARI ÜRET</button>
        )}
        <button onClick={onBack} className="block mx-auto text-xs font-bold text-slate-400 hover:underline">HUB'A DÖN</button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center px-4">
        <h3 className="text-xl font-display font-black text-hunkar dark:text-altin uppercase tracking-widest">Koleksiyonun</h3>
        <button onClick={onBack} className="text-xs font-bold text-slate-400 hover:underline">Geri Dön</button>
      </div>

      {isExtracting ? (
        <div className="py-24 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-altin/20">
          <div className="w-16 h-16 border-4 border-hunkar border-t-transparent rounded-full animate-spin mb-8"></div>
          <h4 className="font-display font-bold text-hunkar dark:text-altin uppercase tracking-widest animate-pulse">Kartlar Mühürleniyor...</h4>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <div key={i} className={`relative group perspective-1000`}>
              <div className={`relative w-full h-[450px] rounded-[2.5rem] border-4 shadow-2xl overflow-hidden transition-all duration-500 hover:-translate-y-4 ${
                card.rarity === 'legendary' ? 'border-amber-500 bg-amber-50' : 
                card.rarity === 'epic' ? 'border-purple-500 bg-purple-50' : 
                card.rarity === 'rare' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
              }`}>
                {/* Card Header */}
                <div className={`p-4 text-center border-b-2 ${
                  card.rarity === 'legendary' ? 'border-amber-200' : 
                  card.rarity === 'epic' ? 'border-purple-200' : 
                  card.rarity === 'rare' ? 'border-blue-200' : 'border-slate-100'
                }`}>
                  <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${
                    card.rarity === 'legendary' ? 'text-amber-600' : 
                    card.rarity === 'epic' ? 'text-purple-600' : 
                    card.rarity === 'rare' ? 'text-blue-600' : 'text-slate-400'
                  }`}>{card.rarity}</span>
                  <h4 className="text-lg font-display font-black text-hunkar dark:text-slate-900 uppercase tracking-widest mt-1">{card.name}</h4>
                </div>

                {/* Card Image Placeholder */}
                <div className="h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-6xl opacity-20">
                  {card.rarity === 'legendary' ? '👑' : card.rarity === 'epic' ? '✨' : '📜'}
                </div>

                {/* Card Stats */}
                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-500 font-serif italic leading-relaxed text-center h-12 overflow-hidden">
                    {card.description}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kudret</div>
                      <div className="text-sm font-display font-black text-hunkar">{card.stats.power}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">İrfan</div>
                      <div className="text-sm font-display font-black text-hunkar">{card.stats.wisdom}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nüfuz</div>
                      <div className="text-sm font-display font-black text-hunkar">{card.stats.influence}</div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="absolute bottom-4 left-0 w-full text-center">
                  <div className="w-12 h-1 bg-altin/20 mx-auto rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionCards;
