
import React, { useState, useEffect, useRef } from 'react';
import { Course, StudySummary } from '../types';
import { generateSummary, generateSpeech, getHistoricalLocations } from '../services/geminiService';
import { saveNote, getNote, saveProgress, getProgress } from '../services/dbService';

interface StudyViewProps {
  course: Course;
}

// Helper functions for audio
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
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
      const base64Audio = await generateSpeech(summary.content.substring(0, 1500));
      const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      if (!audioContextRef.current) audioContextRef.current = ctx;
      
      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        ctx,
        24000,
        1
      );

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
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
      <div className="flex flex-col items-center justify-center py-24 pb-safe">
        <div className="w-14 h-14 border-4 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-slate-500 dark:text-slate-400 font-serif italic animate-pulse text-lg">Arşivler taranıyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-safe">
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-bl-full -z-0 opacity-50"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 dark:text-white leading-tight pr-0 sm:pr-4">{summary?.title}</h2>
          <button 
            onClick={handleListen}
            className={`w-full sm:w-16 h-14 sm:h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-95 ${isPlaying ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}
          >
            {isPlaying ? (
              <span className="flex items-center gap-2 font-bold text-xs uppercase sm:hidden">Durdur <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></span>
            ) : (
              <span className="flex items-center gap-2 font-bold text-xs uppercase sm:hidden">Sesli Dinle <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>
            )}
            <span className="hidden sm:block">
               {isPlaying ? (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </span>
          </button>
        </div>
        
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-base sm:text-lg font-normal mb-8 relative z-10">
          {summary?.content}
        </div>

        {mapData?.chunks && mapData.chunks.length > 0 && (
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Önemli Konumlar</h4>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {mapData.chunks.map((chunk: any, i: number) => (
                chunk.maps && (
                  <a 
                    key={i} 
                    href={chunk.maps.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-100 dark:border-indigo-900 shadow-sm"
                  >
                    📍 {chunk.maps.title || "Haritada Gör"}
                  </a>
                )
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-900 dark:bg-slate-950 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl text-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg sm:text-xl font-serif flex items-center gap-3">
            <span className="text-xl sm:text-2xl">✍️</span> Notlarım
          </h3>
          <button 
            onClick={handleNoteSave}
            disabled={isSavingNote}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs font-bold transition-all ${isSavingNote ? 'bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500 active:scale-95'}`}
          >
            {isSavingNote ? "Kaydedildi" : "Kaydet"}
          </button>
        </div>
        <textarea 
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          placeholder="Dersle ilgili notlarını buraya yaz..."
          className="w-full h-32 sm:h-40 bg-slate-800/50 dark:bg-slate-900/50 border-none rounded-2xl p-4 sm:p-6 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm leading-relaxed"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-[#FAF7F2] dark:bg-slate-900/40 p-6 sm:p-8 rounded-[2rem] border border-[#EBE3D5] dark:border-slate-800 shadow-sm">
          <h3 className="font-serif text-xl sm:text-2xl text-[#5D4037] dark:text-amber-500 mb-6 flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">📜</span> Kronoloji
          </h3>
          <div className="space-y-4 sm:space-y-6">
            {summary?.keyDates.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start group">
                <div className="bg-[#5D4037] dark:bg-amber-600 text-white text-[9px] sm:text-[10px] px-2 sm:px-3 py-1 rounded-full font-bold mt-1 shrink-0">{item.date}</div>
                <div className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">{item.event}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#F0F4F8] dark:bg-slate-900/40 p-6 sm:p-8 rounded-[2rem] border border-[#D1E1F0] dark:border-slate-800 shadow-sm">
          <h3 className="font-serif text-xl sm:text-2xl text-[#2C3E50] dark:text-indigo-400 mb-6 flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">🎖️</span> Önemli Kişiler
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {summary?.importantFigures.map((item, idx) => (
              <div key={idx} className="bg-white/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-white dark:border-slate-700 shadow-sm">
                <div className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{item.name}</div>
                <div className="text-blue-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider mt-1">{item.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyView;