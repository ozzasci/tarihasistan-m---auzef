
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
        <div className="w-16 h-16 border-4 border-altin border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-6 text-hunkar dark:text-altin font-display tracking-widest animate-pulse text-lg">TOZLU RAFLAR ARALANIYOR...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-safe">
      <div className="bg-white/90 dark:bg-black/40 p-8 sm:p-12 rounded-[3rem] shadow-2xl border-x-8 border-altin/20 relative overflow-hidden rumi-border">
        <div className="absolute top-0 left-0 w-full h-4 bg-altin/50"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 relative z-10">
          <div className="flex-1">
             <h2 className="text-3xl sm:text-4xl font-display text-hunkar dark:text-altin leading-tight mb-2 tracking-wide uppercase drop-shadow-sm">{summary?.title}</h2>
             <div className="w-24 h-1 bg-altin"></div>
          </div>
          <button 
            onClick={handleListen}
            className={`w-full sm:w-20 h-16 sm:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 border-4 ${isPlaying ? 'bg-red-700 border-white animate-pulse text-white' : 'bg-altin border-hunkar text-hunkar'}`}
          >
            {isPlaying ? (
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
        </div>
        
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-orange-50/80 leading-relaxed text-lg sm:text-xl font-serif italic mb-10 relative z-10 drop-shadow-sm">
          {summary?.content}
        </div>

        {mapData?.chunks && mapData.chunks.length > 0 && (
          <div className="mt-12 pt-10 border-t-2 border-altin/30">
            <h4 className="text-xs font-display font-black text-hunkar dark:text-altin uppercase tracking-[0.4em] mb-6">Mekan-ı Vakalar</h4>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {mapData.chunks.map((chunk: any, i: number) => (
                chunk.maps && (
                  <a 
                    key={i} 
                    href={chunk.maps.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white/60 dark:bg-black/40 text-hunkar dark:text-altin px-6 py-3.5 rounded-full text-sm font-display font-bold hover:brightness-110 transition-all border-2 border-altin shadow-lg"
                  >
                    📍 {chunk.maps.title || "Harita"}
                  </a>
                )
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-hunkar dark:bg-orange-950/40 p-8 sm:p-10 rounded-[3rem] shadow-2xl text-white border-4 border-altin/40">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl sm:text-2xl font-display font-bold flex items-center gap-4 text-altin">
            <span className="text-3xl">🖋️</span> Tahrir Defterim
          </h3>
          <button 
            onClick={handleNoteSave}
            disabled={isSavingNote}
            className={`px-8 py-3 rounded-full text-xs font-display font-black tracking-widest transition-all ${isSavingNote ? 'bg-enderun text-white' : 'bg-altin text-hunkar hover:brightness-110 active:scale-95'}`}
          >
            {isSavingNote ? "KAYDEDİLDİ" : "KAYDET"}
          </button>
        </div>
        <textarea 
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          placeholder="Mütalaalarınızı buraya tahrir ediniz..."
          className="w-full h-40 sm:h-52 bg-black/20 border-2 border-altin/20 rounded-[2rem] p-6 sm:p-8 text-orange-50 placeholder:text-orange-100/30 focus:ring-4 focus:ring-altin/30 outline-none resize-none text-lg font-serif italic leading-relaxed"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
        <div className="bg-white/80 dark:bg-black/20 p-8 sm:p-10 rounded-[3rem] border-2 border-altin shadow-xl">
          <h3 className="font-display text-2xl sm:text-3xl text-hunkar dark:text-altin mb-8 flex items-center gap-4 border-b-2 border-altin/30 pb-4">
            <span className="text-3xl sm:text-4xl">📜</span> Takvim-i Vekayi
          </h3>
          <div className="space-y-6">
            {summary?.keyDates.map((item, idx) => (
              <div key={idx} className="flex gap-5 items-start group">
                <div className="bg-hunkar text-altin text-[10px] sm:text-[11px] px-4 py-1.5 rounded-full font-display font-black mt-1 shrink-0 border border-altin/30 shadow-md">{item.date}</div>
                <div className="text-slate-800 dark:text-orange-50/80 text-sm sm:text-base leading-relaxed font-serif italic">{item.event}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/80 dark:bg-black/20 p-8 sm:p-10 rounded-[3rem] border-2 border-altin shadow-xl">
          <h3 className="font-display text-2xl sm:text-3xl text-hunkar dark:text-altin mb-8 flex items-center gap-4 border-b-2 border-altin/30 pb-4">
            <span className="text-3xl sm:text-4xl">🎖️</span> Rical-i Devlet
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {summary?.importantFigures.map((item, idx) => (
              <div key={idx} className="bg-parshmen dark:bg-black/40 p-5 rounded-3xl border border-altin/20 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-hunkar rounded-full flex items-center justify-center text-xl border-2 border-altin shrink-0">👤</div>
                <div>
                    <div className="font-display font-bold text-hunkar dark:text-altin text-base sm:text-lg">{item.name}</div>
                    <div className="text-enderun dark:text-orange-200/60 text-[10px] font-display font-bold uppercase tracking-[0.2em] mt-1">{item.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyView;
