
import React, { useState, useEffect } from 'react';
import { Course, RulerNode } from '../types';
import { generateGenealogy } from '../services/geminiService';

interface GenealogyViewProps {
  course: Course;
}

const GenealogyView: React.FC<GenealogyViewProps> = ({ course }) => {
  const [rulers, setRulers] = useState<RulerNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenealogy = async () => {
      setLoading(true);
      try {
        const data = await generateGenealogy(course.name);
        setRulers(data);
      } catch (error) {
        console.error("Soy ağacı hatası:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGenealogy();
  }, [course]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-slate-500 font-serif italic">Hanedan kayıtları düzenleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="relative border-l-2 border-indigo-100 ml-6 space-y-12 pb-12">
        {rulers.map((ruler, idx) => (
          <div key={idx} className="relative pl-12 group">
            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-indigo-600 shadow-sm group-hover:scale-150 transition-transform"></div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-900 font-serif">{ruler.name}</h3>
                <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest">
                  {ruler.period}
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed italic">
                "{ruler.keyAction}"
              </p>
              <div className="mt-4 flex gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                <div className="w-2 h-2 rounded-full bg-slate-200"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 mt-8">
        <h4 className="text-amber-900 font-bold flex items-center gap-2 mb-2">
          <span>💡</span> Bilgi Notu
        </h4>
        <p className="text-sm text-amber-800/80 leading-relaxed">
          Veraset sistemleri, tarihi devletlerin yıkılma ve güçlenme dönemlerini doğrudan etkilemiştir. Bu sıralama, hanedanın meşruiyet çizgisini temsil eder.
        </p>
      </div>
    </div>
  );
};

export default GenealogyView;
