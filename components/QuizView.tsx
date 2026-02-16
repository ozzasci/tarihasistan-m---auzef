
import React, { useState, useEffect } from 'react';
import { Course, QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService';
import { saveProgress } from '../services/dbService';

interface QuizViewProps {
  course: Course;
}

const QuizView: React.FC<QuizViewProps> = ({ course }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      try {
        const data = await generateQuiz(course.name);
        setQuestions(data);
      } catch (error) {
        console.error("Quiz yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [course]);

  const handleAnswer = (idx: number) => {
    if (showExplanation) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    if (idx === questions[currentIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
      // Sınav bittiğinde ilerlemeyi %100 yap
      await saveProgress(course.id, 100);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium italic">Deneme sınavı hazırlanıyor...</p>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 text-center animate-in zoom-in-95 duration-300 max-w-md mx-auto">
        <div className="text-7xl mb-6">🏆</div>
        <h2 className="text-2xl font-serif font-bold text-slate-900">Harika İş!</h2>
        <p className="text-slate-500 mt-2 mb-8">"{course.name}" dersi başarınız:</p>
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-emerald-50 text-emerald-600 text-4xl font-black mb-8 border-4 border-emerald-100 shadow-inner">
          {score}/{questions.length}
        </div>
        <button
          onClick={() => {
            setQuizFinished(false);
            setCurrentIndex(0);
            setScore(0);
            setSelectedAnswer(null);
            setShowExplanation(false);
          }}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
        >
          Tekrar Çöz
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center px-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Soru {currentIndex + 1} / {questions.length}</span>
        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black">PUAN: {score * 20}</span>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[140px] flex items-center">
        <h3 className="text-xl font-serif text-slate-900 leading-relaxed text-center w-full">
          {currentQ.question}
        </h3>
      </div>

      <div className="space-y-3">
        {currentQ.options.map((opt, idx) => {
          let bgColor = "bg-white";
          let borderColor = "border-slate-100";
          let textColor = "text-slate-700";

          if (showExplanation) {
            if (idx === currentQ.correctAnswer) {
              bgColor = "bg-emerald-50";
              borderColor = "border-emerald-200";
              textColor = "text-emerald-700";
            } else if (idx === selectedAnswer) {
              bgColor = "bg-rose-50";
              borderColor = "border-rose-200";
              textColor = "text-rose-700";
            }
          }

          return (
            <button
              key={idx}
              disabled={showExplanation}
              onClick={() => handleAnswer(idx)}
              className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${bgColor} ${borderColor} ${textColor} ${!showExplanation ? 'hover:border-blue-500 hover:shadow-md active:scale-[0.98]' : ''}`}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${showExplanation && idx === currentQ.correctAnswer ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="font-medium text-sm">{opt}</span>
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className="bg-blue-900 p-8 rounded-[2rem] text-white animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💡</span>
            <span className="font-bold text-sm text-blue-300">Cevap Analizi</span>
          </div>
          <p className="text-sm leading-relaxed text-blue-100">{currentQ.explanation}</p>
          <button
            onClick={nextQuestion}
            className="w-full mt-6 bg-white text-blue-900 py-4 rounded-xl font-bold shadow-xl active:scale-95 transition-transform"
          >
            {currentIndex === questions.length - 1 ? "Sınavı Bitir" : "Sıradaki Soru →"}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizView;
