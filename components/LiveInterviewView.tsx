
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Course } from '../types';

interface LiveInterviewViewProps {
  course: Course;
}

const LiveInterviewView: React.FC<LiveInterviewViewProps> = ({ course }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Ses Kodlama Fonksiyonları
  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

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

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    for (const source of sourcesRef.current) {
      source.stop();
    }
    sourcesRef.current.clear();
    setIsActive(false);
    setIsConnecting(false);
  };

  const startSession = async () => {
    if (isActive) {
      stopSession();
      return;
    }

    setIsConnecting(true);
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      alert("API Anahtarı bulunamadı!");
      setIsConnecting(false);
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    // Audio Context Setup
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (!inputAudioContextRef.current) {
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } // Otoriter ve akademik bir ses
          },
          systemInstruction: `Sen uzman bir AUZEF Tarih akademisyenisin. Karşındaki öğrenci Oğuz ile "${course.name}" dersi üzerine canlı bir mülakat yapıyorsun. Üslubun nazik ama akademik olarak ağırbaşlı olmalı. Ona sorular sor, cevaplarını değerlendir ve sınavda çıkabilecek kritik tarihlere vurgu yap. Daima akademik terminoloji kullan.`
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            
            // Mikrofon akışını başlat
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Basit bir ses seviyesi görselleştirme
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i]*inputData[i];
              setAudioLevel(Math.sqrt(sum / inputData.length));

              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBase64 = encode(new Uint8Array(int16.buffer));
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: { data: pcmBase64, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current) s.stop();
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live API Hatası:", e);
            stopSession();
          },
          onclose: () => {
            setIsActive(false);
          }
        }
      });

      sessionRef.current = await sessionPromise;
      // İlk selamlamayı tetikle
      sessionRef.current.sendRealtimeInput({ text: "Selamun aleyküm hocam, mülakata hazır mıyız?" });

    } catch (err) {
      console.error("Başlatma hatası:", err);
      setIsConnecting(false);
      alert("Mikrofon izni verilmedi veya bağlantı kurulamadı.");
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="bg-hunkar p-10 rounded-[4rem] border-4 border-altin shadow-2xl text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-block px-4 py-1 bg-altin/20 text-altin text-[10px] font-display font-black tracking-[0.3em] uppercase mb-4 border border-altin/30 rounded-full">
            Bab-ı Mülakat | Canlı Sesli Oturum
          </div>
          <h2 className="text-3xl font-display font-black text-altin tracking-widest uppercase mb-4">Meclis-i Sadâ</h2>
          <p className="text-orange-50 font-serif italic text-sm opacity-80 max-w-sm mx-auto mb-10 leading-relaxed">
            Asistanınla sesli olarak konuşmaya başla. O sana "${course.name}" dersinden sualler soracak.
          </p>

          <div className="relative flex items-center justify-center mb-10">
            {/* Ses Dalga Animasyonu */}
            {isActive && (
              <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-40">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-altin rounded-full transition-all duration-100"
                    style={{ height: `${20 + (audioLevel * 500 * Math.random())}px` }}
                  ></div>
                ))}
              </div>
            )}

            <button 
              onClick={startSession}
              disabled={isConnecting}
              className={`relative z-20 w-32 h-32 rounded-full border-8 transition-all duration-500 flex flex-col items-center justify-center shadow-2xl active:scale-90 ${
                isActive 
                  ? 'bg-red-800 border-white animate-pulse' 
                  : 'bg-altin border-hunkar hover:scale-105'
              }`}
            >
              {isConnecting ? (
                <div className="w-8 h-8 border-4 border-hunkar border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="text-4xl mb-1">{isActive ? '⏹' : '🎙️'}</span>
                  <span className="text-[10px] font-display font-black tracking-tighter text-hunkar">
                    {isActive ? 'BİTİR' : 'BAŞLAT'}
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="flex justify-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
            <span className="text-[10px] font-display font-black text-altin uppercase tracking-widest">
              {isActive ? 'MÜLAKAT CARİDİR' : 'DİVAN KAPALI'}
            </span>
          </div>
        </div>
        
        {/* Dekoratif Arka Plan */}
        <div className="absolute left-[-40px] top-[-40px] opacity-10 text-[200px] pointer-events-none select-none rotate-[-15deg]">🗣️</div>
      </div>

      <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md p-8 rounded-[3rem] border-2 border-altin/30 shadow-xl">
        <h3 className="text-xs font-display font-black text-hunkar dark:text-altin uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
          <span>📜</span> Mülakat Adabı
        </h3>
        <ul className="text-xs text-slate-700 dark:text-orange-50/70 font-serif italic space-y-3 opacity-90">
          <li className="flex gap-2"><span>•</span> Asistanın sözünü bitirmesini bekle, araya girersen "müdahale-i şerif" olarak algılanır ve asistan susar.</li>
          <li className="flex gap-2"><span>•</span> Sesin net duyulması için gürültüsüz bir mahalde mütalaa yapmanı tavsiye ederiz.</li>
          <li className="flex gap-2"><span>•</span> Cevaplarında tarihleri ve akademik terimleri kullanman asistanın sana vereceği "nişanları" etkileyecektir.</li>
        </ul>
      </div>
    </div>
  );
};

export default LiveInterviewView;
