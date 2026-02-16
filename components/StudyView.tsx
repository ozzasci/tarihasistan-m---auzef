
import React, { useState, useEffect, useRef } from 'react';
import { Course, StudySummary } from '../types';
import { generateSummary, generateSpeech, getHistoricalLocations } from '../services/geminiService';
import { saveNote, getNote, saveProgress, getProgress } from '../services/dbService';

interface StudyViewProps {
  course: Course;
}

const StudyView: React.FC<StudyViewProps> = ({ course }) => {
  const [summary, setSummary] = useState<StudySummary | null>(null);
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userNote, setUserNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sumData, noteData, existingProg] = await Promise.all([
          generateSummary(course.name),
          getNote(course.id),
          getProgress(course.id)
        ]);
        
        setSummary(sumData);
        setUserNote(noteData);
        
        // Konu açıldığında ilerlemeyi otomatik %20 yap (eğer daha düşükse)
        if (existingProg < 20) {
          await saveProgress(course.id, 20);
        }

        const locations = await getHistoricalLocations(course.name, sumData.content.substring(0, 300));
        setMapData(locations);
      } catch (error) {
        console.error("Yükleme hatası:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => { if (audioSourceRef.current) audioSourceRef.current.stop(); };
  }, [course]);

  const handleNoteSave = async () => {
    setIsSavingNote(true);
    await saveNote(course.id, userNote);
    // Not alındığında ilerlemeyi %50'ye çıkar
    const currentProg = await getProgress(course.id);
    if (currentProg < 50) await saveProgress(course.id, 50);
    setTimeout(() => setIsSavingNote(false), 800);
  };

  const handleListen = async () => {
    if (isPlaying) {
      if (audioSourceRef.current) audioSourceRef.current.stop();
      setIsPlaying(false);
      return;
    }

    if (!summary) return;
    
    setIsPlaying(true);
    try {
      const audioData = await generateSpeech(summary.content.substring(0, 1500));
      const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      if (!audioContextRef.current) audioContextRef.current = ctx;
      
      const dataInt16 = new Int16Array(audioData);
      const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      audioSourceRef.current = source;
    } catch (error) {
      console.error("Ses hatası:", error);
      setIsPlaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-14 h-14 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-slate-500 font-serif italic animate-pulse text-lg">Tarih arşivleri taranıyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {/* Summary Card */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-0 opacity-50"></div>
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h2 className="text-3xl font-serif text-slate-900 leading-tight pr-4">{summary?.title}</h2>
          <button 
            onClick={handleListen}
            className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-95 ${isPlaying ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
        </div>
        
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-lg font-normal mb-8 relative z-10">
          {summary?.content}
        </div>

        {mapData?.chunks && mapData.chunks.length > 0 && (
          <div className="mt-10 pt-8 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">İlgili Coğrafi Konumlar</h4>
            <div className="flex flex-wrap gap-3">
              {mapData.chunks.map((chunk: any, i: number) => (
                chunk.maps && (
                  <a 
                    key={i} 
                    href={chunk.maps.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm"
                  >
                    📍 {chunk.maps.title || "Haritada Gör"}
                  </a>
                )
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Notes Area */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-serif flex items-center gap-3">
            <span className="text-2xl">✍️</span> Ders Notlarım
          </h3>
          <button 
            onClick={handleNoteSave}
            disabled={isSavingNote}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${isSavingNote ? 'bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            {isSavingNote ? "Kaydedildi! ✓" : "Notu Kaydet"}
          </button>
        </div>
        <textarea 
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          placeholder="Dersle ilgili önemli gördüğün kısımları buraya not alabilirsin..."
          className="w-full h-40 bg-slate-800 border-none rounded-2xl p-6 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm leading-relaxed"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#FAF7F2] p-8 rounded-[2rem] border border-[#EBE3D5] shadow-sm">
          <h3 className="font-serif text-2xl text-[#5D4037] mb-6 flex items-center gap-3">
            <span className="text-3xl">📜</span> Kronoloji
          </h3>
          <div className="space-y-6">
            {summary?.keyDates.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start group">
                <div className="bg-[#5D4037] text-white text-[10px] px-3 py-1 rounded-full font-bold mt-1 shadow-sm group-hover:scale-110 transition-transform">{item.date}</div>
                <div className="text-slate-700 text-sm leading-relaxed font-medium">{item.event}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#F0F4F8] p-8 rounded-[2rem] border border-[#D1E1F0] shadow-sm">
          <h3 className="font-serif text-2xl text-[#2C3E50] mb-6 flex items-center gap-3">
            <span className="text-3xl">🎖️</span> Önemli Şahsiyetler
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {summary?.importantFigures.map((item, idx) => (
              <div key={idx} className="bg-white/80 p-4 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
                <div className="font-bold text-slate-900 text-base">{item.name}</div>
                <div className="text-blue-600 text-xs font-bold uppercase tracking-wider mt-1">{item.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyView;
