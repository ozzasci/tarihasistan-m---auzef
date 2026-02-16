
import React, { useState, useEffect } from 'react';
import { Course, QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService';

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

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Deneme sınavı hazırlanıyor...</p>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 text-center animate-in zoom-in-95 duration-300">
        <div className="text-6xl mb-6">🎓</div>
        <h2 className="text-2xl font-bold text-slate-900">Sınav Tamamlandı!</h2>
        <p className="text-slate-500 mt-2 mb-8">"{course.name}" dersi başarınız:</p>
        <div className="text-5xl font-bold text-emerald-600 mb-8">
          {score} / {questions.length}
        </div>
        <button
          onClick={() => {
            setQuizFinished(false);
            setCurrentIndex(0);
            setScore(0);
            setSelectedAnswer(null);
            setShowExplanation(false);
          }}
          className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center px-2">
        <span className="text-sm font-bold text-slate-400">Soru {currentIndex + 1} / {questions.length}</span>
        <span className="text-sm font-bold text-emerald-600">Puan: {score}</span>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-medium text-slate-900 leading-relaxed">
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
              className={`w-full p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${bgColor} ${borderColor} ${textColor} ${!showExplanation ? 'hover:border-blue-400 hover:bg-blue-50 active:scale-[0.98]' : ''}`}
            >
              <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-bold text-slate-500">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="font-medium">{opt}</span>
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="font-bold text-blue-800 mb-1">Açıklama:</div>
          <p className="text-blue-700 text-sm leading-relaxed">{currentQ.explanation}</p>
          <button
            onClick={nextQuestion}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform"
          >
            {currentIndex === questions.length - 1 ? "Sınavı Bitir" : "Sıradaki Soru →"}
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizView;
