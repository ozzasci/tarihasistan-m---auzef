
import React, { useState, useEffect } from 'react';
import { Course, QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService'; // 20 soru için güncellenmiş mantıkla kullanılacak
import { saveProgress } from '../services/dbService';
import { COURSES } from '../constants';

interface ExamPracticeViewProps {
  onBack: () => void;
}

type ExamStage = 'setup' | 'testing' | 'result';
type ExamType = 'vize' | 'final' | 'butunleme';

const ExamPracticeView: React.FC<ExamPracticeViewProps> = ({ onBack }) => {
  const [stage, setStage] = useState<ExamStage>('setup');
  const [selectedCourse, setSelectedCourse] = useState<Course>(COURSES[0]);
  const [examType, setExamType] = useState<ExamType>('vize');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(1800); // 30 dakika

  const startExam = async () => {
    setLoading(true);
    try {
      // 20 soruluk akademik sınav üretimi
      const context = `${selectedCourse.name} - ${examType.toUpperCase()} SINAVI. 20 soru, akademik dil.`;
      const data = await generateQuiz(context); // Not: Servis tarafında soru sayısını 20 yapacak prompt gönderilmeli
      setQuestions(data);
      setUserAnswers(new Array(data.length).fill(null));
      setStage('testing');
      setCurrentIndex(0);
    } catch (error) {
      alert("İmtihan kağıtları hazırlanırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIdx: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = optionIdx;
    setUserAnswers(newAnswers);
  };

  const calculateResult = () => {
    let correct = 0;
    let wrong = 0;
    let empty = 0;

    userAnswers.forEach((ans, i) => {
      if (ans === null) empty++;
      else if (ans === questions[i].correctAnswer) correct++;
      else wrong++;
    });

    const net = correct - (wrong / 3);
    const score = Math.max(0, Math.round(net * (100 / questions.length)));
    
    return { correct, wrong, empty, net, score };
  };

  const getRewardMessage = (score: number) => {
    if (score >= 85) return { msg: "ÂLÂ! Tebrikler müverrih Oğuz, bugün kütüphaneden çıkıp biraz nefes almayı hak ettin. Bir kahve içmeye ne dersin?", icon: "🏆" };
    if (score >= 60) return { msg: "MUVAFFAKİYET YAKIN! Gayretin yerinde ancak birkaç fermanı daha hıfzetmen gerekiyor.", icon: "📜" };
    return { msg: "MÜREKKEBİN KURUMUŞ... Mahzene dönüp fasılları tekrar mütalaa etmelisin evladım.", icon: "🕯️" };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-in fade-in">
        <div className="w-20 h-20 border-8 border-altin border-t-hunkar rounded-full animate-spin mb-8"></div>
        <p className="text-hunkar dark:text-altin font-display tracking-[0.3em] uppercase text-sm animate-pulse">İmtihan Kağıtları Mühürleniyor...</p>
      </div>
    );
  }

  if (stage === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-6 pb-20">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] border-4 border-altin shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 text-8xl">📝</div>
          <h2 className="text-3xl font-display font-black text-hunkar dark:text-altin tracking-widest uppercase mb-8">Darülfünun Sınav Provası</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-display font-black text-slate-400 uppercase tracking-widest mb-2">Tedrisat Seçimi</label>
              <select 
                value={selectedCourse.id}
                onChange={(e) => setSelectedCourse(COURSES.find(c => c.id === e.target.value)!)}
                className="w-full bg-parshmen dark:bg-slate-800 border-2 border-altin/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-altin dark:text-white"
              >
                {COURSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-display font-black text-slate-400 uppercase tracking-widest mb-2">İmtihan Nevi</label>
              <div className="grid grid-cols-3 gap-3">
                {(['vize', 'final', 'butunleme'] as ExamType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setExamType(type)}
                    className={`py-4 rounded-2xl font-display font-bold text-[10px] uppercase tracking-widest transition-all border-2 ${
                      examType === type ? 'bg-hunkar text-altin border-altin shadow-lg scale-105' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={startExam}
                className="w-full bg-altin text-hunkar py-5 rounded-[2rem] font-display font-black text-sm tracking-[0.3em] shadow-xl hover:brightness-110 active:scale-95 transition-all border-b-4 border-amber-700"
              >
                İMTİHANA GİR ✒️
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'result') {
    const res = calculateResult();
    const reward = getRewardMessage(res.score);
    return (
      <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-500 pb-20">
        <div className="bg-white dark:bg-slate-900 rounded-[4rem] border-4 border-altin shadow-2xl overflow-hidden text-center">
          <div className="bg-hunkar p-10">
            <div className="text-7xl mb-4">{reward.icon}</div>
            <h3 className="text-3xl font-display font-black text-altin tracking-widest uppercase">BERAT-I MUVAFFAKİYET</h3>
          </div>
          
          <div className="p-10 space-y-8">
            <div className="flex justify-around items-center">
              <div className="text-center">
                <div className="text-4xl font-display font-black text-emerald-600">{res.correct}</div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">DOĞRU</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-display font-black text-rose-600">{res.wrong}</div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">YANLIŞ</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-display font-black text-slate-400">{res.empty}</div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">BOŞ</div>
              </div>
            </div>

            <div className="py-8 border-y-2 border-slate-100 dark:border-slate-800">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">NET PUAN (3 YANLIŞ 1 DOĞRU)</div>
               <div className="text-6xl font-display font-black text-hunkar dark:text-altin">{res.score}</div>
            </div>

            <p className="text-lg font-serif italic text-slate-700 dark:text-orange-50/80 leading-relaxed px-6">
              "{reward.msg}"
            </p>

            <div className="flex gap-4">
               <button onClick={() => setStage('setup')} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 py-4 rounded-2xl font-display font-bold text-xs uppercase tracking-widest">YENİDEN DENE</button>
               <button onClick={onBack} className="flex-1 bg-hunkar text-altin py-4 rounded-2xl font-display font-bold text-xs uppercase tracking-widest shadow-lg">ANA SAYFA</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right-10 duration-500 pb-20">
      <div className="flex justify-between items-center bg-hunkar p-4 rounded-2xl border-2 border-altin shadow-xl text-altin px-8">
        <div className="font-display font-bold text-[10px] uppercase tracking-widest">
          {selectedCourse.name} | {examType.toUpperCase()}
        </div>
        <div className="font-mono font-bold text-lg">
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border-x-8 border-altin/20">
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-white leading-relaxed mb-10">
          {currentQ.question}
        </h3>

        <div className="space-y-4">
          {currentQ.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 group ${
                userAnswers[currentIndex] === idx 
                  ? 'bg-hunkar border-altin text-altin' 
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-altin/50'
              }`}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                userAnswers[currentIndex] === idx ? 'bg-altin text-hunkar' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="font-serif text-sm">{opt}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center gap-4">
        <button 
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(prev => prev - 1)}
          className="flex-1 bg-white/50 dark:bg-slate-800 py-4 rounded-2xl font-display font-bold text-xs uppercase text-slate-500 disabled:opacity-30 border-2 border-slate-100"
        >
          Önceki Sual
        </button>
        {currentIndex === questions.length - 1 ? (
          <button 
            onClick={() => setStage('result')}
            className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-display font-black text-xs uppercase tracking-widest shadow-xl border-b-4 border-emerald-800"
          >
            İMTİHANI BİTİR ⚖️
          </button>
        ) : (
          <button 
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="flex-1 bg-hunkar text-altin py-4 rounded-2xl font-display font-black text-xs uppercase tracking-widest shadow-xl border-b-4 border-amber-900"
          >
            Sıradaki Sual →
          </button>
        )}
      </div>
    </div>
  );
};

export default ExamPracticeView;
