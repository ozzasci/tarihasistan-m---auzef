
import React, { useState, useEffect } from 'react';
import { Course, HistoryWheelItem } from '../../types';
import { generateHistoryWheel } from '../../services/geminiService';
import { getUnitPDF } from '../../services/dbService';
import { blobToBase64 } from '../../services/pdfService';

interface HistoryWheelProps {
  course: Course;
  selectedUnit: number;
  onBack: () => void;
}

const HistoryWheel: React.FC<HistoryWheelProps> = ({ course, selectedUnit, onBack }) => {
  const [items, setItems] = useState<HistoryWheelItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedItem, setSelectedItem] = useState<HistoryWheelItem | null>(null);

  useEffect(() => {
    loadWheel();
  }, [course.id, selectedUnit]);

  const loadWheel = async () => {
    setLoading(true);
    try {
      const pdfBlob = await getUnitPDF(course.id, selectedUnit);
      if (!pdfBlob) {
        alert("Lütfen önce fasıl PDF'ini yükle.");
        onBack();
        return;
      }
      const base64 = await blobToBase64(pdfBlob);
      const data = await generateHistoryWheel(course.name, base64);
      setItems(data);
    } catch (error) {
      console.error("Çark yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const spinWheel = () => {
    if (isSpinning || items.length === 0) return;
    setIsSpinning(true);
    setSelectedItem(null);
    
    const extraDegrees = Math.floor(Math.random() * 360) + 1440; // At least 4 full spins
    const newRotation = rotation + extraDegrees;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const actualDegrees = newRotation % 360;
      const itemIndex = Math.floor((360 - actualDegrees) / (360 / items.length)) % items.length;
      setSelectedItem(items[itemIndex]);
    }, 4000);
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-altin shadow-xl">
        <div className="w-16 h-16 border-4 border-hunkar border-t-transparent rounded-full animate-spin mb-8"></div>
        <h4 className="font-display font-bold text-hunkar dark:text-altin uppercase tracking-widest animate-pulse">Felek-i Tarih Hazırlanıyor...</h4>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 flex flex-col items-center">
      <div className="relative w-80 h-80 sm:w-96 sm:h-96">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 text-4xl">👇</div>
        
        {/* Wheel */}
        <div 
          className="w-full h-full rounded-full border-8 border-hunkar shadow-2xl relative overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1)"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {items.map((item, i) => {
            const angle = 360 / items.length;
            const rotate = i * angle;
            return (
              <div 
                key={i}
                className="absolute top-0 left-1/2 w-1/2 h-full origin-left flex items-center justify-end pr-4 text-[10px] font-display font-black text-white uppercase tracking-widest"
                style={{ 
                  transform: `rotate(${rotate}deg)`,
                  backgroundColor: i % 2 === 0 ? '#1a1a1a' : '#c5a059',
                  clipPath: `polygon(0 0, 100% 0, 100% ${100/items.length}%, 0 100%)` // Simple triangle approximation
                }}
              >
                <span className="rotate-90 origin-center translate-x-4">{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Center Button */}
        <button 
          onClick={spinWheel}
          disabled={isSpinning}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-hunkar border-4 border-altin shadow-xl z-30 flex items-center justify-center text-altin font-display font-black text-xs tracking-widest hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSpinning ? '...' : 'ÇEVİR'}
        </button>
      </div>

      {selectedItem && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-4 border-altin shadow-2xl w-full max-w-lg text-center space-y-4 animate-in zoom-in-95 duration-500">
          <div className="inline-block px-4 py-1 rounded-full bg-altin/10 text-altin text-[10px] font-black uppercase tracking-widest border border-altin/20">
            {selectedItem.category}
          </div>
          <h3 className="text-2xl font-display font-black text-hunkar dark:text-altin uppercase tracking-widest">{selectedItem.label}</h3>
          <p className="text-sm text-slate-500 font-serif italic leading-relaxed">
            {selectedItem.content}
          </p>
        </div>
      )}

      <button onClick={onBack} className="text-xs font-bold text-slate-400 hover:underline">HUB'A DÖN</button>
    </div>
  );
};

export default HistoryWheel;
