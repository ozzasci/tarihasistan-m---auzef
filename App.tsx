
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
import { getCurrentUser, checkUnitExists } from './services/dbService';

type ViewState = 'home' | 'course' | 'library' | 'achievements' | 'comparison' | 'profile' | 'settings' | 'community' | 'planner';
type TabState = 'pdf' | 'study' | 'quiz' | 'chat' | 'interview' | 'glossary' | 'flashcards' | 'genealogy' | 'geography';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedUnit, setSelectedUnit] = useState(1);
  const [activeTab, setActiveTab] = useState<TabState>('pdf');
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [hasPdf, setHasPdf] = useState(false);
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

  const handleCourseSelect = async (course: Course) => {
    setSelectedCourse(course);
    setSelectedUnit(1);
    const exists = await checkUnitExists(course.id, 1);
    setHasPdf(exists);
    setActiveTab('pdf');
    setCurrentView('course');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const checkPdfStatus = async () => {
    if (selectedCourse) {
      const exists = await checkUnitExists(selectedCourse.id, selectedUnit);
      setHasPdf(exists);
    }
  };

  useEffect(() => {
    checkPdfStatus();
  }, [selectedUnit, selectedCourse]);

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
           <button onClick={() => setCurrentView('home')} className="p-4 sm:p-6 text-hunkar dark:text-altin font-display font-bold hover:opacity-80 transition-colors">← Geri Dön</button>
           <AchievementsView />
        </div>
      );
    }

    if (currentView === 'comparison') {
      return (
        <div className="animate-in fade-in duration-500 pb-20 sm:pb-32 pb-safe">
           <button onClick={() => setCurrentView('home')} className="p-6 sm:p-8 text-hunkar dark:text-altin font-display font-bold hover:opacity-80 transition-colors">← Geri Dön</button>
           <ComparisonView />
        </div>
      );
    }

    if (currentView === 'home' || !selectedCourse) {
      return (
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8 sm:space-y-12 pb-safe">
          <div className="text-center relative pt-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-10 pointer-events-none">
                <svg width="200" height="200" viewBox="0 0 200 200" fill="currentColor" className="text-hunkar dark:text-altin">
                    <path d="M100 0C100 0 80 40 40 40C40 40 0 60 0 100C0 140 40 160 40 160C40 160 80 200 100 200C100 200 120 160 160 160C160 160 200 140 200 100C200 60 160 40 160 40C160 40 120 0 100 0Z" />
                </svg>
            </div>
            <h1 className="text-4xl sm:text-6xl font-display text-hunkar dark:text-altin mb-2 tracking-widest drop-shadow-sm uppercase">Vakanüvis</h1>
            <p className="text-enderun dark:text-orange-200/60 font-serif italic text-base sm:text-lg px-4">Safa geldiniz, {user.name.split(' ')[0]}. Tedrisatınıza nereden devam edelim?</p>
            
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-10 sm:mt-12">
              {[
                { id: 'planner', icon: '📜', label: 'Haftalık Program', color: 'border-hunkar text-hunkar' },
                { id: 'library', icon: '🏛️', label: 'Beytü\'l-Hikme', color: 'border-enderun text-enderun' },
                { id: 'community', icon: '🤝', label: 'Meclis-i İrfan', color: 'border-selcuk text-selcuk' },
                { id: 'comparison', icon: '⚖️', label: 'Vaka-i Mütalaa', color: 'border-amber-700 text-amber-700' }
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setCurrentView(item.id as ViewState)}
                  className={`inline-flex items-center gap-2 sm:gap-3 bg-white/50 dark:bg-black/20 border-2 ${item.color} dark:border-altin/40 dark:text-altin px-5 sm:px-8 py-4 rounded-full shadow-md font-display font-bold hover:bg-white dark:hover:bg-black/40 transition-all active:scale-95 group flex-1 min-w-[160px] justify-center text-xs tracking-widest`}
                >
                  <span className="text-xl group-hover:scale-125 transition-transform">{item.icon}</span> 
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-md mx-auto">
             <StudyTimer />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {COURSES.map(course => (
              <CourseCard key={course.id} course={course} onClick={handleCourseSelect} />
            ))}
          </div>
        </div>
      );
    }

    const renderTabContent = () => {
      if (activeTab === 'pdf') return <PDFView course={selectedCourse} selectedUnit={selectedUnit} onUnitChange={setSelectedUnit} onUploadSuccess={checkPdfStatus} />;
      
      if (!hasPdf) {
        return (
          <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-hunkar/10 text-hunkar rounded-full flex items-center justify-center text-5xl mb-6 border-4 border-hunkar/20 border-dashed">🔒</div>
            <h3 className="text-2xl font-display font-bold text-hunkar dark:text-altin uppercase tracking-widest mb-4">Mütalaa Kilitli</h3>
            <p className="text-slate-600 dark:text-orange-50/60 font-serif italic max-w-md mx-auto mb-8">
              "İlim, kaynağından öğrenilir." Müverrih Oğuz, {selectedUnit}. fasıl için henüz bir ferman hıfzetmemişsin. Lütfen önce PDF'i yükle.
            </p>
            <button 
              onClick={() => setActiveTab('pdf')}
              className="bg-hunkar text-altin px-10 py-4 rounded-full font-display font-black text-sm tracking-widest shadow-xl hover:brightness-110 transition-all"
            >
              FASLI YÜKLE 📄
            </button>
          </div>
        );
      }

      switch (activeTab) {
        case 'study': return <StudyView course={selectedCourse} selectedUnit={selectedUnit} onUnitChange={setSelectedUnit} />;
        case 'geography': return <GeographyView course={selectedCourse} />;
        case 'genealogy': return <GenealogyView course={selectedCourse} />;
        case 'flashcards': return <FlashcardsView course={selectedCourse} />;
        case 'quiz': return <QuizView course={selectedCourse} />;
        case 'chat': return <AIChat course={selectedCourse} />;
        case 'interview': return <CharacterInterview course={selectedCourse} />;
        case 'glossary': return <GlossaryView />;
        default: return null;
      }
    };

    return (
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 animate-in fade-in duration-300 pb-24 sm:pb-32 pb-safe">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2 text-hunkar dark:text-altin font-display font-bold hover:opacity-70 transition-all group p-2"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Geri
          </button>
          <div className="scale-90 origin-right">
             <StudyTimer />
          </div>
        </div>

        <div className="flex items-center gap-6 mb-10">
          <div className={`bg-hunkar w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-4xl sm:text-5xl shadow-2xl border-4 border-altin`}>
            {selectedCourse.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-hunkar dark:text-altin leading-tight truncate">{selectedCourse.name}</h1>
            <p className="text-enderun dark:text-orange-200/60 font-serif italic text-sm sm:text-base">AUZEF Ders-i Saadet | {selectedUnit}. Ünite</p>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-black/20 backdrop-blur-md p-2 rounded-full border-2 border-altin/30 shadow-xl mb-10 sticky top-[72px] sm:top-[88px] z-40 overflow-x-auto no-scrollbar overflow-touch">
          <div className="flex min-w-max gap-1">
            {[
              { id: 'pdf', label: 'Kitap', icon: '📄' },
              { id: 'study', label: 'Hülasa', icon: '📜' },
              { id: 'geography', label: 'Harita', icon: '🌍' },
              { id: 'genealogy', label: 'Şecere', icon: '🌳' },
              { id: 'flashcards', label: 'Ezber', icon: '🗂️' },
              { id: 'interview', label: 'Mülakat', icon: '👤' },
              { id: 'quiz', label: 'İmtihan', icon: '📝' },
              { id: 'chat', label: 'Müşavir', icon: '🤖' },
              { id: 'glossary', label: 'Lügat', icon: '📖' }
            ].map((tab) => (
              <button 
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => {
                    setActiveTab(tab.id as TabState);
                }}
                className={`px-5 sm:px-6 py-3 rounded-full font-display font-bold text-[10px] sm:text-[11px] tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id ? 'bg-hunkar text-white shadow-xl scale-105 border border-altin z-10' : 'text-hunkar dark:text-altin hover:bg-white/50'}`}
              >
                <span>{tab.icon}</span> 
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {renderTabContent()}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-12 transition-colors duration-500">
      <nav className="bg-white/60 dark:bg-black/40 backdrop-blur-lg border-b-4 border-altin py-4 sm:py-6 px-4 sm:px-8 sticky top-0 z-50 shadow-lg pt-safe">
        <div className="flex items-center justify-between max-w-5xl mx-auto h-12">
          <span className="font-display text-2xl sm:text-3xl font-black text-hunkar dark:text-altin tracking-widest">VAKANÜVİS</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentView('settings')}
              className="w-10 h-10 rounded-full border-2 border-altin/30 flex items-center justify-center text-lg hover:bg-altin/10 transition-all active:scale-90"
            >
              ⚙️
            </button>
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full border-2 border-altin/30 flex items-center justify-center text-lg hover:bg-altin/10 transition-all active:scale-90"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button 
              onClick={() => setCurrentView('profile')}
              className="w-10 h-10 rounded-full bg-hunkar text-altin flex items-center justify-center text-sm font-bold shadow-lg active:scale-90 transition-all overflow-hidden border-2 border-altin"
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
