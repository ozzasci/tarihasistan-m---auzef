
import React, { useState, useEffect } from 'react';
import { INITIAL_GLOSSARY } from '../constants';
import { Course, Term } from '../types';
import { getUnitPDF, saveGlossary, getGlossary } from '../services/dbService';
import { extractGlossary } from '../services/geminiService';
import { blobToBase64 } from '../services/pdfService';

interface GlossaryViewProps {
  course: Course;
  selectedUnit: number;
}

const GlossaryView: React.FC<GlossaryViewProps> = ({ course, selectedUnit }) => {
  const [search, setSearch] = useState('');
  const [terms, setTerms] = useState<Term[]>(INITIAL_GLOSSARY);
  const [isExtracting, setIsExtracting] = useState(false);
  const [hasPdf, setHasPdf] = useState(false);

  useEffect(() => {
    loadGlossary();
    checkPdf();
  }, [course.id, selectedUnit]);

  const checkPdf = async () => {
    const pdf = await getUnitPDF(course.id, selectedUnit);
    setHasPdf(!!pdf);
  };

  const loadGlossary = async () => {
    const saved = await getGlossary(course.id, selectedUnit);
    if (saved) {
      setTerms(saved);
    } else {
      setTerms(INITIAL_GLOSSARY);
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
      const extractedTerms = await extractGlossary(course.name, base64);
      
      if (extractedTerms && extractedTerms.length > 0) {
        setTerms(extractedTerms);
        await saveGlossary(course.id, selectedUnit, extractedTerms);
      } else {
        alert("Terim çıkarılamadı.");
      }
    } catch (error) {
      console.error("Lügatçe çıkarma hatası:", error);
      alert("Lügatçe oluşturulurken bir hata oluştu.");
    } finally {
      setIsExtracting(false);
    }
  };

  const filtered = terms.filter(t => 
    t.word.toLowerCase().includes(search.toLowerCase()) || 
    t.meaning.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input 
            type="text"
            placeholder="Tarih terimi ara (Örn: İltizam)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border-2 border-altin/20 rounded-[2rem] px-12 py-5 text-base shadow-xl focus:border-altin outline-none transition-all"
          />
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl opacity-40">🔍</span>
        </div>
        
        {hasPdf && (
          <button 
            onClick={handleExtract}
            disabled={isExtracting}
            className={`px-8 py-5 rounded-[2rem] font-display font-black text-[10px] tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 border-2 ${isExtracting ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-hunkar text-altin border-altin hover:brightness-110 active:scale-95'}`}
          >
            {isExtracting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                TARANIYOR...
              </>
            ) : (
              <>
                <span>📖</span> FASILDAN ÇIKAR
              </>
            )}
          </button>
        )}
      </div>

      <div className="bg-parshmen/50 dark:bg-slate-900/50 p-4 rounded-[2.5rem] border-2 border-dashed border-altin/20 mb-8">
        <p className="text-[10px] text-center font-serif italic text-slate-500">
          {terms === INITIAL_GLOSSARY 
            ? "Şu an genel lügatçe gösteriliyor. Derse özel terimler için 'Fasıldan Çıkar' butonunu kullanabilirsiniz." 
            : `${course.name} - ${selectedUnit}. Ünite için özel lügatçe oluşturuldu.`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((term, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border-2 border-altin/10 shadow-sm hover:shadow-md hover:border-altin/40 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-altin/5 rounded-bl-full -mr-4 -mt-4 group-hover:bg-altin/10 transition-colors"></div>
            <h3 className="text-lg font-display font-bold text-hunkar dark:text-altin mb-2 group-hover:translate-x-1 transition-transform">{term.word}</h3>
            <p className="text-slate-600 dark:text-orange-50/60 text-sm leading-relaxed font-serif italic">{term.meaning}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center opacity-40">
            <div className="text-6xl mb-4">📖</div>
            <p className="font-serif italic">Terim bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlossaryView;

