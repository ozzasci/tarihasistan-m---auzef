
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
        <div className="animate-in fade-in duration-500 pb-safe">
           <button onClick={() => setCurrentView('home')} className="p-4 sm:p-6 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white transition-colors">← Geri Dön</button>
           <AchievementsView />
        </div>
      );
    }

    if (currentView === 'comparison') {
      return (
        <div className="animate-in fade-in duration-500 pb-20 sm:pb-32 pb-safe">
           <button onClick={() => setCurrentView('home')} className="p-6 sm:p-8 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white transition-colors">← Geri Dön</button>
           <ComparisonView />
        </div>
      );
    }

    if (currentView === 'home' || !selectedCourse) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8 sm:space-y-10 pb-safe">
          <div className="text-center relative">
            <h1 className="text-3xl sm:text-4xl font-serif text-slate-900 dark:text-white mb-2 tracking-tight">TarihAsistanım</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base px-4">Hoş geldin, {user.name.split(' ')[0]}! Bugün ne öğreniyoruz?</p>
            
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
              {[
                { id: 'planner', icon: '📅', label: 'Planım', color: 'text-amber-600' },
                { id: 'library', icon: '📚', label: 'Kütüphane', color: 'text-indigo-600' },
                { id: 'community', icon: '👥', label: 'Topluluk', color: 'text-blue-600' },
                { id: 'comparison', icon: '⚖️', label: 'Analiz', color: 'text-rose-600' }
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setCurrentView(item.id as ViewState)}
                  className={`inline-flex items-center gap-2 sm:gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3 rounded-2xl shadow-sm ${item.color} dark:text-white font-bold hover:border-indigo-200 dark:hover:border-slate-600 transition-all active:scale-95 group flex-1 min-w-[140px] justify-center text-sm`}
                >
                  <span className="text-lg group-hover:rotate-12 transition-transform">{item.icon}</span> 
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-md mx-auto">
             <StudyTimer />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {COURSES.map(course => (
              <CourseCard key={course.id} course={course} onClick={handleCourseSelect} />
            ))}
          </div>

          <div className="bg-amber-100 dark:bg-amber-950/40 border-2 border-amber-200 dark:border-amber-900 rounded-[2.5rem] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-amber-50 dark:shadow-none">
             <div className="flex items-center gap-4 sm:gap-6 text-center md:text-left">
                <div className="text-4xl sm:text-5xl">📅</div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-amber-900 dark:text-amber-200 font-serif">Sınavlar Yaklaşıyor!</h3>
                  <p className="text-amber-800 dark:text-amber-400 text-xs sm:text-sm opacity-80">Vize Haftası: 26-27 Nisan 2025</p>
                </div>
             </div>
             <button 
              onClick={() => setCurrentView('planner')}
              className="w-full md:w-auto bg-amber-900 dark:bg-amber-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-200 active:scale-95 transition-all"
             >
               Planla
             </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 animate-in fade-in duration-300 pb-24 sm:pb-32 pb-safe">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button 
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold hover:text-slate-900 dark:hover:text-white transition-all group p-2"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Geri
          </button>
          <div className="scale-90 origin-right">
             <StudyTimer />
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div className={`${selectedCourse.color} w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-4xl shadow-2xl border-2 sm:border-4 border-white dark:border-slate-800`}>
            {selectedCourse.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white leading-tight truncate">{selectedCourse.name}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm">AUZEF Lisans Programı | 3. Sınıf</p>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-1.5 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl mb-8 sm:mb-10 sticky top-[72px] sm:top-[88px] z-40 overflow-x-auto no-scrollbar overflow-touch">
          <div className="flex min-w-max gap-1">
            {[
              { id: 'study', label: 'Özet', icon: '📚' },
              { id: 'geography', label: 'Harita', icon: '🌍' },
              { id: 'genealogy', label: 'Soy Ağacı', icon: '🌳' },
              { id: 'flashcards', label: 'Ezber', icon: '🗂️' },
              { id: 'interview', label: 'Röportaj', icon: '👤' },
              { id: 'pdf', label: 'PDF Kitap', icon: '📄' },
              { id: 'quiz', label: 'Sınav', icon: '📝' },
              { id: 'chat', label: 'Chat', icon: '🤖' },
              { id: 'glossary', label: 'Sözlük', icon: '📖' }
            ].map((tab) => (
              <button 
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => {
                    setActiveTab(tab.id as TabState);
                    document.getElementById(`tab-${tab.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className={`px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-105 z-10' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
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
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 py-3 sm:py-5 px-4 sm:px-8 sticky top-0 z-50 shadow-sm pt-safe">
        <div className="flex items-center justify-between max-w-5xl mx-auto h-12">
          <span className="font-serif text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">TarihAsistanım</span>
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setCurrentView('settings')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg hover:bg-slate-200 transition-all active:scale-90"
              title="Ayarlar"
            >
              ⚙️
            </button>
            <button 
              onClick={toggleTheme}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg hover:bg-slate-200 transition-all active:scale-90"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button 
              onClick={() => setCurrentView('profile')}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-sm font-bold shadow-lg active:scale-90 transition-all overflow-hidden"
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