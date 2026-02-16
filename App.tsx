
import React, { useState, useEffect } from 'react';
import { COURSES } from './constants';
import { Course, User } from './types';
import CourseCard from './components/CourseCard';
import StudyView from './components/StudyView';
import QuizView from './components/QuizView';
import AIChat from './components/AIChat';
import PDFView from './components/PDFView';
import LibraryView from './components/LibraryView';
import CharacterInterview from './components/CharacterInterview';
import GlossaryView from './components/GlossaryView';
import FlashcardsView from './components/FlashcardsView';
import StudyTimer from './components/StudyTimer';
import GenealogyView from './components/GenealogyView';
import AchievementsView from './components/AchievementsView';
import ComparisonView from './components/ComparisonView';
import GeographyView from './components/GeographyView';
import AuthView from './components/AuthView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import CommunityView from './components/CommunityView';
import WeeklyPlanner from './components/WeeklyPlanner';
import { getCurrentUser } from './services/dbService';

type ViewState = 'home' | 'course' | 'library' | 'achievements' | 'comparison' | 'profile' | 'settings' | 'community' | 'planner';
type TabState = 'study' | 'quiz' | 'chat' | 'pdf' | 'interview' | 'glossary' | 'flashcards' | 'genealogy' | 'geography';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<TabState>('study');
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsAppLoading(false);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

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

  if (isAppLoading) return null;

  if (!user) {
    return <AuthView onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  const renderContent = () => {
    if (currentView === 'library') {
      return <LibraryView onSelectCourse={(id) => handleCourseSelect(COURSES.find(c => c.id === id)!)} onBack={() => setCurrentView('home')} />;
    }

    if (currentView === 'profile') {
      return <ProfileView user={user} onUpdate={(u) => setUser(u)} onLogout={() => setUser(null)} onBack={() => setCurrentView('home')} />;
    }

    if (currentView === 'settings') {
      return <SettingsView onBack={() => setCurrentView('home')} theme={theme} onToggleTheme={toggleTheme} />;
    }

    if (currentView === 'community') {
      return <CommunityView user={user} onBack={() => setCurrentView('home')} />;
    }

    if (currentView === 'planner') {
      return <WeeklyPlanner user={user} onBack={() => setCurrentView('home')} />;
    }

    if (currentView === 'achievements') {
      return (
        <div className="animate-in fade-in duration-500">
           <button onClick={() => setCurrentView('home')} className="p-4 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white transition-colors">← Geri Dön</button>
           <AchievementsView />
        </div>
      );
    }

    if (currentView === 'comparison') {
      return (
        <div className="animate-in fade-in duration-500 pb-20">
           <button onClick={() => setCurrentView('home')} className="p-8 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white transition-colors">← Geri Dön</button>
           <ComparisonView />
        </div>
      );
    }

    if (currentView === 'home' || !selectedCourse) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
          <div className="text-center relative">
            <h1 className="text-4xl font-serif text-slate-900 dark:text-white mb-2 tracking-tight">TarihAsistanım</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Hoş geldin, {user.name.split(' ')[0]}! Çalışmaya hazır mısın?</p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button 
                onClick={() => setCurrentView('planner')}
                className="inline-flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-2xl shadow-sm text-amber-600 dark:text-amber-400 font-bold hover:border-amber-200 dark:hover:border-amber-800 transition-all active:scale-95 group"
              >
                <span className="text-xl group-hover:rotate-12 transition-transform">📅</span> 
                Haftalık Planım
              </button>
              <button 
                onClick={navigateToLibrary}
                className="inline-flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-2xl shadow-sm text-indigo-600 dark:text-indigo-400 font-bold hover:border-indigo-200 dark:hover:border-indigo-800 transition-all active:scale-95 group"
              >
                <span className="text-xl group-hover:rotate-12 transition-transform">📚</span> 
                Kütüphanem
              </button>
              <button 
                onClick={() => setCurrentView('community')}
                className="inline-flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-2xl shadow-sm text-blue-600 dark:text-blue-400 font-bold hover:border-blue-200 dark:hover:border-blue-800 transition-all active:scale-95 group"
              >
                <span className="text-xl group-hover:rotate-12 transition-transform">👥</span> 
                Topluluk
              </button>
              <button 
                onClick={() => setCurrentView('comparison')}
                className="inline-flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-2xl shadow-sm text-rose-600 dark:text-rose-400 font-bold hover:border-rose-200 dark:hover:border-rose-800 transition-all active:scale-95 group"
              >
                <span className="text-xl group-hover:rotate-12 transition-transform">⚖️</span> 
                Analiz
              </button>
            </div>
          </div>

          <div className="max-w-md mx-auto">
             <StudyTimer />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {COURSES.map(course => (
              <CourseCard key={course.id} course={course} onClick={handleCourseSelect} />
            ))}
          </div>

          {/* Exam Alert Card */}
          <div className="bg-amber-100 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-900 rounded-[3rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-amber-50 dark:shadow-none">
             <div className="flex items-center gap-6">
                <div className="text-5xl">📅</div>
                <div>
                  <h3 className="text-xl font-bold text-amber-900 dark:text-amber-200 font-serif">Sınavlar Yaklaşıyor!</h3>
                  <p className="text-amber-800 dark:text-amber-400 text-sm opacity-80">Bahar Dönemi Ara Sınav: 26-27 Nisan 2025</p>
                </div>
             </div>
             <button 
              onClick={() => setCurrentView('planner')}
              className="bg-amber-900 dark:bg-amber-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-200 active:scale-95 transition-all"
             >
               Hemen Planla
             </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 py-6 animate-in fade-in duration-300 pb-24">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold hover:text-slate-900 dark:hover:text-white transition-all group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Geri Dön
          </button>
          <div className="scale-75 origin-right">
             <StudyTimer />
          </div>
        </div>

        <div className="flex items-center gap-6 mb-10">
          <div className={`${selectedCourse.color} w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-2xl shadow-slate-200 dark:shadow-none border-4 border-white dark:border-slate-800`}>
            {selectedCourse.icon}
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white leading-tight">{selectedCourse.name}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">AUZEF Lisans Programı | 3. Sınıf</p>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-2 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl mb-10 sticky top-4 z-40 overflow-x-auto no-scrollbar">
          <div className="flex min-w-max gap-1">
            {[
              { id: 'study', label: 'Özet', icon: '📚' },
              { id: 'geography', label: 'Coğrafya', icon: '🌍' },
              { id: 'genealogy', label: 'Soy Ağacı', icon: '🌳' },
              { id: 'flashcards', label: 'Ezber', icon: '🗂️' },
              { id: 'interview', label: 'Röportaj', icon: '👤' },
              { id: 'pdf', label: 'PDF Kitap', icon: '📄' },
              { id: 'quiz', label: 'Sınav', icon: '📝' },
              { id: 'chat', label: 'Soru-Cevap', icon: '🤖' },
              { id: 'glossary', label: 'Sözlük', icon: '📖' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabState)}
                className={`px-5 py-3.5 rounded-2xl font-black text-[11px] transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-105 z-10' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'study' && <StudyView course={selectedCourse} />}
          {activeTab === 'geography' && <GeographyView course={selectedCourse} />}
          {activeTab === 'genealogy' && <GenealogyView course={selectedCourse} />}
          {activeTab === 'flashcards' && <FlashcardsView course={selectedCourse} />}
          {activeTab === 'pdf' && <PDFView course={selectedCourse} />}
          {activeTab === 'quiz' && <QuizView course={selectedCourse} />}
          {activeTab === 'chat' && <AIChat course={selectedCourse} />}
          {activeTab === 'interview' && <CharacterInterview course={selectedCourse} />}
          {activeTab === 'glossary' && <GlossaryView />}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 py-5 px-8 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <span className="font-serif text-2xl font-black text-slate-900 dark:text-white tracking-tight">TarihAsistanım</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentView('settings')}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
              title="Ayarlar"
            >
              ⚙️
            </button>
            <button 
              onClick={toggleTheme}
              className="hidden sm:flex w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
              title={theme === 'light' ? 'Gece Modu' : 'Gündüz Modu'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button onClick={() => setCurrentView('achievements')} className="hidden md:flex w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 items-center justify-center text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">🏆</button>
            <button 
              onClick={() => setCurrentView('profile')}
              className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-sm font-bold shadow-lg active:scale-95 transition-all overflow-hidden"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="P" className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto">{renderContent()}</main>
    </div>
  );
};

export default App;
