
import React, { useState } from 'react';
import { Course, DuelChallenge } from '../../types';
import { generateDuelChallenge } from '../../services/geminiService';
import { getUnitPDF } from '../../services/dbService';
import { blobToBase64 } from '../../services/pdfService';

interface HistoricalDuelProps {
  course: Course;
  selectedUnit: number;
  onBack: () => void;
}

const HistoricalDuel: React.FC<HistoricalDuelProps> = ({ course, selectedUnit, onBack }) => {
  const [challenge, setChallenge] = useState<DuelChallenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const startDuel = async () => {
    setLoading(true);
    try {
      const pdfBlob = await getUnitPDF(course.id, selectedUnit);
      if (!pdfBlob) {
        alert("Lütfen önce fasıl PDF'ini yükle.");
        onBack();
        return;
      }
      const base64 = await blobToBase64(pdfBlob);
      const data = await generateDuelChallenge(course.name, base64, "Vakanüvis Asistan");
      setChallenge(data);
      setCurrentQuestion(0);
      setScore(0);
      setGameOver(false);
    } catch (error) {
      console.error("Düello başlatılamadı:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === challenge!.questions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
    }
    
    setTimeout(() => {
      if (currentQuestion < challenge!.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedOption(null);
      } else {
        setGameOver(true);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-altin shadow-xl">
        <div className="w-16 h-16 border-4 border-hunkar border-t-transparent rounded-full animate-spin mb-8"></div>
        <h4 className="font-display font-bold text-hunkar dark:text-altin uppercase tracking-widest animate-pulse">Düello Hazırlanıyor...</h4>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="py-12 px-8 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-altin shadow-xl text-center space-y-8">
        <div className="text-7xl">🏆</div>
        <h2 className="text-3xl font-display font-black text-hunkar dark:text-altin uppercase tracking-widest">Düello Sona Erdi</h2>
        <div className="text-5xl font-display font-black text-altin">{score} / {challenge?.questions.length}</div>
        <p className="text-slate-500 font-serif italic max-w-md mx-auto">
          {score === challenge?.questions.length ? "Muazzam! Tarih ilmine tam vakıfsın." : "Gayretin takdire şayan, lakin mütalaayı artırmalısın."}
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={startDuel} className="bg-hunkar text-altin px-8 py-4 rounded-full font-display font-black text-xs tracking-widest border-2 border-altin">YENİDEN DÜELLO</button>
          <button onClick={onBack} className="bg-white text-hunkar px-8 py-4 rounded-full font-display font-black text-xs tracking-widest border-2 border-hunkar">HUB'A DÖN</button>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="py-12 px-8 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-altin shadow-xl text-center space-y-8">
        <div className="text-7xl">⚔️</div>
        <h2 className="text-2xl font-display font-black text-hunkar dark:text-altin uppercase tracking-widest">Tarihsel Düello</h2>
        <p className="text-slate-500 font-serif italic max-w-md mx-auto">
          Asistanın ile bilgi düellosuna girmeye hazır mısın? Fasıl metninden üretilen zorlayıcı sorular seni bekliyor.
        </p>
        <button onClick={startDuel} className="bg-hunkar text-altin px-12 py-5 rounded-full font-display font-black text-sm tracking-widest border-2 border-altin shadow-xl active:scale-95 transition-all">DÜELLOYU BAŞLAT</button>
        <button onClick={onBack} className="block mx-auto text-xs font-bold text-slate-400 hover:underline">VAZGEÇ</button>
      </div>
    );
  }

  const q = challenge.questions[currentQuestion];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-hunkar p-4 rounded-full border-2 border-altin text-altin px-8">
        <span className="font-display font-bold text-xs uppercase tracking-widest">Soru {currentQuestion + 1} / {challenge.questions.length}</span>
        <span className="font-display font-bold text-xs uppercase tracking-widest">Skor: {score}</span>
      </div>

      <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border-4 border-altin/20 shadow-2xl space-y-8">
        <h3 className="text-xl font-serif font-bold text-hunkar dark:text-white leading-relaxed text-center">
          {q.question}
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`p-6 rounded-2xl border-2 text-left font-display font-bold text-sm transition-all ${
                selectedOption === null 
                  ? 'bg-parshmen/30 border-altin/10 hover:border-altin hover:bg-altin/5' 
                  : idx === q.correctAnswer 
                    ? 'bg-emerald-500 border-emerald-600 text-white' 
                    : selectedOption === idx 
                      ? 'bg-red-500 border-red-600 text-white' 
                      : 'bg-parshmen/30 border-altin/10 opacity-50'
              }`}
            >
              <span className="mr-4 opacity-40">{String.fromCharCode(65 + idx)})</span>
              {opt}
            </button>
          ))}
        </div>

        {selectedOption !== null && (
          <div className="p-6 bg-altin/10 rounded-2xl border-2 border-altin/20 animate-in slide-in-from-bottom-4">
            <p className="text-xs text-hunkar dark:text-altin font-serif italic leading-relaxed">
              <span className="font-bold uppercase not-italic mr-2">İzah:</span>
              {q.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalDuel;
