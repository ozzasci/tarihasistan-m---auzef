
import React, { useState } from 'react';
import { COURSES } from './constants';
import { Course } from './types';
import CourseCard from './components/CourseCard';
import StudyView from './components/StudyView';
import QuizView from './components/QuizView';
import AIChat from './components/AIChat';
import PDFView from './components/PDFView';
import LibraryView from './components/LibraryView';

type ViewState = 'home' | 'course' | 'library';

const App: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'study' | 'quiz' | 'chat' | 'pdf'>('study');
  const [currentView, setCurrentView] = useState<ViewState>('home');

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setActiveTab('study');
    setCurrentView('course');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLibrary = () => {
    setCurrentView('library');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLibraryCourseSelect = (courseId: string) => {
    const course = COURSES.find(c => c.id === courseId);
    if (course) {
      handleCourseSelect(course);
    }
  };

  const renderContent = () => {
    if (currentView === 'library') {
      return <LibraryView onSelectCourse={handleLibraryCourseSelect} onBack={() => setCurrentView('home')} />;
    }

    if (currentView === 'home' || !selectedCourse) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-10 text-center relative">
            <h1 className="text-4xl font-serif text-slate-900 mb-2">TarihAsistanım</h1>
            <p className="text-slate-500 font-medium">AUZEF Tarih Bölümü - 3. Sınıf Çalışma Platformu</p>
            
            <button 
              onClick={navigateToLibrary}
              className="mt-6 inline-flex items-center gap-3 bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm text-indigo-600 font-bold hover:border-indigo-200 hover:bg-indigo-50 transition-all active:scale-95 group"
            >
              <span className="text-xl group-hover:rotate-12 transition-transform">📚</span> 
              Dijital Kütüphaneme Git
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {COURSES.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                onClick={handleCourseSelect} 
              />
            ))}
          </div>

          <div className="mt-16 bg-blue-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-lg">
              <h2 className="text-2xl font-bold mb-3">Yapay Zeka Destekli Öğrenme</h2>
              <p className="text-blue-100 mb-6 text-sm leading-relaxed">
                Her ders için özel hazırlanmış özetler, interaktif deneme sınavları ve 7/24 sorulabilecek sorularla sınavlara tam hazır olun.
              </p>
              <div className="flex gap-4">
                <div className="bg-blue-800/50 px-4 py-2 rounded-lg text-xs font-bold border border-blue-700">Ünite Özetleri</div>
                <div className="bg-blue-800/50 px-4 py-2 rounded-lg text-xs font-bold border border-blue-700">Hızlı Quizler</div>
              </div>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-[180px] select-none">🏛️</div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 py-6 animate-in fade-in duration-300 pb-24">
        <button 
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors mb-6 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Ana Sayfa
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className={`${selectedCourse.color} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-slate-200`}>
            {selectedCourse.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{selectedCourse.name}</h1>
            <p className="text-slate-500 text-sm">3. Sınıf Güz/Bahar Dönemi</p>
          </div>
        </div>

        <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm mb-8 sticky top-4 z-40 overflow-x-auto no-scrollbar">
          <div className="flex min-w-max gap-1">
            <button 
              onClick={() => setActiveTab('study')}
              className={`px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'study' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              📚 Konu Özeti
            </button>
            <button 
              onClick={() => setActiveTab('pdf')}
              className={`px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'pdf' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              📄 Ders PDF
            </button>
            <button 
              onClick={() => setActiveTab('quiz')}
              className={`px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'quiz' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              📝 Deneme Sınavı
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              🤖 Asistana Sor
            </button>
          </div>
        </div>

        {activeTab === 'study' && <StudyView course={selectedCourse} />}
        {activeTab === 'pdf' && <PDFView course={selectedCourse} />}
        {activeTab === 'quiz' && <QuizView course={selectedCourse} />}
        {activeTab === 'chat' && <AIChat course={selectedCourse} />}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-12">
      <nav className="bg-white border-b border-slate-100 py-4 px-6 sticky top-0 z-50 shadow-sm md:hidden">
        <div className="flex items-center justify-between">
          <span className="font-serif text-xl font-bold text-blue-600">TarihAsistanım</span>
          <div className="flex gap-2">
            <button onClick={navigateToLibrary} className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-sm" title="Kütüphane">📚</button>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">👤</div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto">
        {renderContent()}
      </main>

      {currentView === 'home' && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
           <button 
            onClick={navigateToLibrary}
            className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-200 active:scale-95 transition-transform"
            title="Kütüphanem"
          >
            📚
          </button>
          <button 
            title="Yardım"
            className="w-14 h-14 bg-white text-slate-600 border border-slate-200 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
