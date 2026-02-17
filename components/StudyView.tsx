
import React, { useState, useEffect, useRef } from 'react';
import { Course, StudySummary } from '../types';
import { generateSummary, generateSpeech, getHistoricalLocations } from '../services/geminiService';
import { saveNote, getNote, getProgress, getAllPDFKeys, getUnitPDF } from '../services/dbService';

interface StudyViewProps {
  course: Course;
  selectedUnit: number;
  onUnitChange: (unit: number) => void;
}

// PDF'i Base64'e çeviren yardımcı fonksiyon
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
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

const StudyView: React.FC<StudyViewProps> = ({ course, selectedUnit, onUnitChange }) => {
  const [summary, setSummary] = useState<StudySummary | null>(null);
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userNote, setUserNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [uploadedKeys, setUploadedKeys] = useState<string[]>([]);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    fetchData();
    getAllPDFKeys().then(setUploadedKeys);
    return () => { if (audioSourceRef.current) audioSourceRef.current.stop(); };
  }, [course, selectedUnit]);

  const fetchData = async () => {
    setLoading(true);
    setSummary(null);
    try {
      // Önce PDF verisini mahzenden al
      const pdfBlob = await getUnitPDF(course.id, selectedUnit);
      let pdfBase64: string | undefined;
      
      if (pdfBlob) {
        pdfBase64 = await blobToBase64(pdfBlob);
      }

      const [sumData, noteData] = await Promise.all([
        generateSummary(`${course.name} - ${selectedUnit}. Ünite`, pdfBase64),
        getNote(`${course.id}_unit_${selectedUnit}`)
      ]);
      
      setSummary(sumData);
      setUserNote(noteData);
      
      const locations = await getHistoricalLocations(course.name, `${selectedUnit}. ünite: ${sumData.content.substring(0, 300)}`);
      setMapData(locations);
    } catch (error) {
      console.error("Mütalaa hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteSave = async () => {
    setIsSavingNote(true);
    await saveNote(`${course.id}_unit_${selectedUnit}`, userNote);
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
      const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      audioSourceRef.current = source;
    } catch (error) {
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-safe">
      <div className="bg-hunkar p-4 rounded-[2rem] border-2 border-altin shadow-xl overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-max px-2">
          {Array.from({ length: 14 }, (_, i) => i + 1).map(num => {
             const isUploaded = uploadedKeys.includes(`${course.id}_unit_${num}`);
             return (
              <button
                key={num}
                onClick={() => onUnitChange(num)}
                className={`px-6 py-2 rounded-xl font-display font-bold text-[10px] tracking-widest transition-all border-2 ${
                  selectedUnit === num 
                    ? 'bg-altin text-hunkar border-white scale-105' 
                    : isUploaded 
                      ? 'bg-white/10 text-white border-white/20' 
                      : 'bg-black/20 text-white/30 border-transparent opacity-50'
                }`}
              >
                {num === 1 ? '1. MEBDE' : `${num}. FASIL`} {isUploaded ? '✓' : ''}
              </button>
             );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 border-4 border-altin border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-6 text-hunkar dark:text-altin font-display tracking-widest animate-pulse uppercase">
             {selectedUnit === 1 ? "BİSMİLLAH, 1. ÜNİTE" : `${selectedUnit}. FASIL`} DERİN HIFZ EDİLİYOR...
          </p>
          <p className="mt-2 text-[10px] text-slate-400 font-serif italic">"Müşavir fasıl fermanını okuyor, sabır berekettir."</p>
        </div>
      ) : (
        <>
          <div className="bg-white/90 dark:bg-black/40 p-8 sm:p-12 rounded-[3rem] shadow-2xl border-x-8 border-altin/20 relative overflow-hidden rumi-border">
            <div className="absolute top-0 left-0 w-full h-4 bg-altin/50"></div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 relative z-10">
              <div className="flex-1">
                 <h2 className="text-3xl sm:text-4xl font-display text-hunkar dark:text-altin leading-tight mb-2 tracking-wide uppercase">{selectedUnit === 1 ? '1. Fasıl (Mebde)' : `${selectedUnit}. Fasıl`}: {summary?.title}</h2>
                 <div className="w-24 h-1 bg-altin"></div>
              </div>
              <button 
                onClick={handleListen}
                className={`w-full sm:w-20 h-16 sm:h-20 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-95 border-4 ${isPlaying ? 'bg-red-700 border-white animate-pulse text-white' : 'bg-altin border-hunkar text-hunkar'}`}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-orange-50/80 leading-relaxed text-lg sm:text-xl font-serif italic mb-10 relative z-10">
              {summary?.content}
            </div>
            
            {summary?.keyDates && summary.keyDates.length > 0 && (
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {summary.keyDates.map((kd, i) => (
                   <div key={i} className="bg-parshmen dark:bg-slate-900/40 p-4 rounded-2xl border-l-4 border-altin">
                      <span className="text-[10px] font-black text-hunkar dark:text-altin uppercase">{kd.date}</span>
                      <p className="text-sm font-serif italic mt-1">{kd.event}</p>
                   </div>
                 ))}
              </div>
            )}
          </div>

          <div className="bg-hunkar dark:bg-orange-950/40 p-8 rounded-[3rem] shadow-2xl text-white border-4 border-altin/40">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-display font-bold flex items-center gap-4 text-altin">
                <span>🖋️</span> {selectedUnit}. Fasıl Mütalaalarım
              </h3>
              <button 
                onClick={handleNoteSave}
                disabled={isSavingNote}
                className={`px-8 py-3 rounded-full text-xs font-display font-black tracking-widest transition-all ${isSavingNote ? 'bg-enderun text-white' : 'bg-altin text-hunkar hover:brightness-110'}`}
              >
                {isSavingNote ? "HIFZEDİLDİ" : "HIFZET"}
              </button>
            </div>
            <textarea 
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder={`${selectedUnit}. fasıl mütalaalarınızı buraya tahrir ediniz...`}
              className="w-full h-40 bg-black/20 border-2 border-altin/20 rounded-[2rem] p-6 text-orange-50 placeholder:text-orange-100/30 outline-none resize-none text-lg font-serif italic"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default StudyView;
