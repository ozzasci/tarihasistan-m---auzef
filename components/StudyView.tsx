
import React, { useState, useEffect } from 'react';
import { Course, StudySummary } from '../types';
import { generateSummary } from '../services/geminiService';

interface StudyViewProps {
  course: Course;
}

const StudyView: React.FC<StudyViewProps> = ({ course }) => {
  const [summary, setSummary] = useState<StudySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const data = await generateSummary(course.name);
        setSummary(data);
      } catch (error) {
        console.error("Özet yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [course]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Akademik özet hazırlanıyor...</p>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-serif text-slate-900 mb-4">{summary.title}</h2>
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
          {summary.content}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-xl">📅</span> Önemli Tarihler
          </h3>
          <div className="space-y-4">
            {summary.keyDates.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start border-l-2 border-blue-100 pl-4 py-1">
                <span className="font-bold text-blue-600 shrink-0">{item.date}</span>
                <span className="text-slate-600 text-sm">{item.event}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-xl">👑</span> Önemli Şahsiyetler
          </h3>
          <div className="space-y-4">
            {summary.importantFigures.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                <div className="font-bold text-slate-800">{item.name}</div>
                <div className="text-slate-500 text-xs italic">{item.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyView;
