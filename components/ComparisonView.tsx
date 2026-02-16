
import React, { useState } from 'react';
import { ComparisonResult } from '../types';
import { compareHistory } from '../services/geminiService';
import { COURSES } from '../constants';

const ComparisonView: React.FC = () => {
  const [target1, setTarget1] = useState(COURSES[0].name);
  const [target2, setTarget2] = useState(COURSES[1].name);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    setLoading(true);
    try {
      const data = await compareHistory(target1, target2);
      setResult(data);
    } catch (error) {
      console.error("Karşılaştırma hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6 text-center">Karşılaştırmalı Tarih Analizi</h2>
        
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          <select 
            value={target1}
            onChange={(e) => setTarget1(e.target.value)}
            className="flex-1 w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            {COURSES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          
          <div className="text-2xl font-black text-slate-300">VS</div>
          
          <select 
            value={target2}
            onChange={(e) => setTarget2(e.target.value)}
            className="flex-1 w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500"
          >
            {COURSES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        <button 
          onClick={handleCompare}
          disabled={loading || target1 === target2}
          className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-sm shadow-xl shadow-slate-200 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "Analiz Ediliyor..." : "Sistemleri Karşılaştır"}
        </button>
      </div>

      {loading && (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-serif italic">Devlet yapıları ve askeri sistemler analiz ediliyor...</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          <div className="grid grid-cols-1 gap-6">
            {result.aspects.map((aspect, idx) => (
              <div key={idx} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
                <div className="bg-slate-50 p-6 md:w-1/4 flex items-center justify-center text-center">
                  <h4 className="font-black text-slate-400 text-xs uppercase tracking-widest leading-tight">{aspect.title}</h4>
                </div>
                <div className="p-8 flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">{result.entities[0]}</div>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{aspect.entity1Info}</p>
                  </div>
                  <div className="space-y-2 pt-6 md:pt-0 md:pl-8">
                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">{result.entities[1]}</div>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{aspect.entity2Info}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <h3 className="text-xl font-serif font-bold mb-4 relative z-10 flex items-center gap-3">
              <span className="text-3xl">📝</span> Akademik Sonuç
            </h3>
            <p className="text-indigo-100 leading-relaxed text-base italic relative z-10 opacity-90">
              {result.conclusion}
            </p>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-[180px] select-none rotate-12">🏛️</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonView;
