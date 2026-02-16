
import React, { useState, useRef, useEffect } from 'react';
import { Course, ChatMessage } from '../types';
import { interviewCharacter } from '../services/geminiService';

interface CharacterInterviewProps {
  course: Course;
}

const CharacterInterview: React.FC<CharacterInterviewProps> = ({ course }) => {
  const character = course.featuredCharacter;
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Ben ${character?.name}, ${character?.title}. Zamanın ötesinden seninle konuşmaya geldim. Dönemim ve kararlarım hakkında ne bilmek istersin?` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping || !character) return;
    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    try {
      const history = messages.concat(userMsg).map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const response = await interviewCharacter(character.name, character.title, history);
      setMessages(prev => [...prev, { role: 'model', text: response || "Sözlerim rüzgara karıştı, tekrar sor evlat." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Zaman tünelinde bir aksaklık oldu..." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!character) return <div className="p-8 text-center text-slate-400 font-serif">Bu ders için henüz bir karakter atanmadı.</div>;

  return (
    <div className="flex flex-col h-[600px] bg-[#FAF7F2] rounded-[2.5rem] shadow-2xl border border-[#EBE3D5] overflow-hidden">
      <div className="bg-[#5D4037] p-6 flex items-center gap-4 text-white">
        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/20">
          {character.avatar}
        </div>
        <div>
          <div className="text-xl font-serif font-bold tracking-wide">{character.name}</div>
          <div className="text-[10px] text-amber-200 uppercase tracking-widest font-black">{character.title}</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-5 rounded-3xl shadow-sm text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-[#5D4037] text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-[#EBE3D5] rounded-tl-none font-serif italic'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2 rounded-full border border-[#EBE3D5] flex gap-1 items-center scale-75 origin-left">
              <div className="w-1.5 h-1.5 bg-[#5D4037] rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-[#5D4037] rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-[#5D4037] rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white/50 border-t border-[#EBE3D5] flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`${character.name} kişisine sor...`}
          className="flex-1 bg-white border border-[#EBE3D5] rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-[#5D4037] outline-none shadow-inner"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="w-14 h-14 bg-[#5D4037] text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-transform disabled:opacity-50"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  );
};

export default CharacterInterview;
