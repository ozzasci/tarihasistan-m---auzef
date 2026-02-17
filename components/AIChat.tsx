
import React, { useState, useRef, useEffect } from 'react';
import { Course, ChatMessage } from '../types';
import { chatWithTutor } from '../services/geminiService';

interface AIChatProps {
  course: Course;
}

const AIChat: React.FC<AIChatProps> = ({ course }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Merhaba! Ben ${course.name} ders asistanınım. Bu dersle ilgili takıldığın her şeyi bana sorabilirsin.` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.concat(userMsg).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await chatWithTutor(course.name, history);
      setMessages(prev => [...prev, { role: 'model', text: response || "Üzgünüm, şu an cevap veremiyorum." }]);
    } catch (error) {
      console.error("Chat hatası:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Bir hata oluştu. Lütfen tekrar deneyin." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] sm:h-[600px] bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="bg-slate-900 dark:bg-slate-950 p-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-lg shadow-lg">🤖</div>
          <div>
            <div className="text-sm font-bold">Tarih Asistanı</div>
            <div className="text-[10px] text-blue-300 uppercase tracking-widest font-black">CANLI | {course.name}</div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-slate-50/50 dark:bg-slate-900/50 no-scrollbar overflow-touch">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[90%] sm:max-w-[80%] p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2 shrink-0 pb-safe">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Tarihi bir soru sor..."
          className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none dark:text-white"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AIChat;