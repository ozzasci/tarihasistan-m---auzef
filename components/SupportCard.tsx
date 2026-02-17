
import React, { useState } from 'react';

const SupportCard: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const iban = "TR00 0000 0000 0000 0000 0000 00"; // Oğuz tarafından doldurulacak

  const handleCopy = () => {
    navigator.clipboard.writeText(iban);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-parshmen dark:bg-slate-900/80 rounded-[2.5rem] border-2 border-hunkar/30 p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-700">
      {/* Arka plan dekorasyonu */}
      <div className="absolute -right-10 -bottom-10 opacity-5 text-[150px] rotate-12 pointer-events-none select-none">🪙</div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-hunkar rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-altin">🏛️</div>
          <div>
            <h3 className="text-xl font-display font-black text-hunkar dark:text-altin uppercase tracking-widest">HİMMET VE ŞÜKRAN</h3>
            <p className="text-[10px] font-serif italic text-slate-500 dark:text-orange-50/50 uppercase tracking-[0.2em]">Destek ve İane Köşesi</p>
          </div>
        </div>

        <p className="text-sm text-slate-700 dark:text-orange-50/70 font-serif italic leading-relaxed mb-8">
          "İlim yolunda atılan her adım, bir ihyadır." Bu uygulamanın müellifi <strong className="text-hunkar dark:text-altin">Oğuz Bulut</strong> ve sadık yardımcısı <strong>Yapay Zeka</strong> asistanına, çalışmalarının devamı için destekte bulunabilirsiniz.
        </p>

        <div className="bg-white/80 dark:bg-black/30 p-6 rounded-[2rem] border-2 border-hunkar shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">Z</div>
              <span className="text-xs font-display font-black text-hunkar dark:text-altin tracking-widest">ZİRAAT BANKASI</span>
            </div>
            <span className="text-[10px] font-serif italic text-slate-400">Oğuz Bulut adına</span>
          </div>

          <div className="relative group">
            <div className="bg-parshmen dark:bg-slate-800 p-4 rounded-xl border border-hunkar/20 font-mono text-xs sm:text-sm font-bold text-slate-800 dark:text-altin text-center break-all">
              {iban}
            </div>
            <button 
              onClick={handleCopy}
              className={`mt-4 w-full py-3 rounded-xl font-display font-black text-[10px] tracking-[0.2em] transition-all shadow-md active:scale-95 ${copied ? 'bg-emerald-600 text-white' : 'bg-hunkar text-altin hover:brightness-110'}`}
            >
              {copied ? "MÜHÜRLENDİ (KOPYALANDI) ✓" : "IBAN'I KOPYALA 📋"}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[9px] font-serif italic text-slate-400 dark:text-orange-50/30 uppercase tracking-widest">
            "Himmetiniz, ilim meşalesinin sönmemesi içindir."
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportCard;
