
import React, { useState } from 'react';
import { INITIAL_GLOSSARY } from '../constants';

const GlossaryView: React.FC = () => {
  const [search, setSearch] = useState('');
  const filtered = INITIAL_GLOSSARY.filter(t => 
    t.word.toLowerCase().includes(search.toLowerCase()) || 
    t.meaning.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <div className="relative">
        <input 
          type="text"
          placeholder="Tarih terimi ara (Örn: İltizam)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border-2 border-slate-100 rounded-[2rem] px-12 py-5 text-base shadow-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
        />
        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl opacity-40">🔍</span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((term, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{term.word}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{term.meaning}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-20 text-center opacity-40">
            <div className="text-6xl mb-4">📖</div>
            <p className="font-serif italic">Terim bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlossaryView;
