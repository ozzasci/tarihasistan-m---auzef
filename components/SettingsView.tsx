
import React, { useState, useEffect } from 'react';
import { getAllPDFs, deleteAllPDFs } from '../services/dbService';
import SupportCard from './SupportCard';

interface SettingsViewProps {
  onBack: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onBack, theme, onToggleTheme }) => {
  const [notifExam, setNotifExam] = useState(true);
  const [storageSize, setStorageSize] = useState('0 MB');

  useEffect(() => {
    calcStorage();
  }, []);

  const calcStorage = async () => {
    const pdfs = await getAllPDFs();
    let total = 0;
    pdfs.forEach(p => total += p.blob.size);
    setStorageSize((total / (1024 * 1024)).toFixed(1) + ' MB');
  };

  const handleClearData = () => {
    if (window.confirm("Tüm ders ilerlemeleriniz ve notlarınız silinecektir. Bu işlem geri alınamaz. Emin misiniz?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleClearLibrary = async () => {
    if (window.confirm("Kütüphanenizdeki tüm çevrimdışı kitaplar (PDF dosyaları) silinecektir. Devam etmek istiyor musunuz?")) {
      try {
        await deleteAllPDFs();
        setStorageSize('0 MB');
        alert("Kütüphane başarıyla temizlendi.");
      } catch (error) {
        alert("Silme işlemi sırasında bir hata oluştu.");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-6 duration-500 pb-20">
      <div className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="text-slate-400 dark:text-slate-500 font-bold hover:text-slate-900 dark:hover:text-white flex items-center gap-2 group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Geri Dön
        </button>
        <h2 className="text-2xl font-serif font-black text-slate-900 dark:text-white uppercase tracking-widest">Uygulama Ayarları</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* App Config Section */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span>🛠️</span> Tercihler
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Görünüm Modu</div>
                  <div className="text-xs text-slate-500">Uygulama temasını değiştirin.</div>
                </div>
                <button 
                  onClick={onToggleTheme}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300"
                >
                  {theme === 'light' ? 'Gündüz ☀️' : 'Gece 🌙'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Sınav Hatırlatıcıları</div>
                  <div className="text-xs text-slate-500">AUZEF sınav takvimi bildirimleri.</div>
                </div>
                <div 
                  onClick={() => setNotifExam(!notifExam)}
                  className={`w-12 h-6 rounded-full transition-all cursor-pointer p-1 ${notifExam ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-all ${notifExam ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Storage Section */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Veri Kullanımı</h3>
             <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Çevrimdışı Kitaplar</span>
                <span className="text-sm font-mono font-black text-indigo-600">{storageSize}</span>
             </div>
             <div className="space-y-3">
               <button 
                onClick={handleClearLibrary}
                className="w-full py-4 text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-2xl hover:bg-amber-600 hover:text-white transition-all"
               >
                 📂 Kitaplığı Temizle
               </button>
               <button 
                onClick={handleClearData}
                className="w-full py-4 text-xs font-black uppercase tracking-widest text-rose-500 bg-rose-50 dark:bg-rose-950/20 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"
               >
                 ⚠️ Tüm Verileri Sıfırla
               </button>
             </div>
          </div>
        </div>

        {/* Support and Credits Section */}
        <div className="space-y-8">
          <SupportCard />
          
          <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-[2.5rem] text-center border-2 border-slate-200 dark:border-slate-700 shadow-inner">
            <div className="text-3xl mb-4">🚀</div>
            <div className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Versiyon</div>
            <div className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">v2.5.0 Academic Edition</div>
            <p className="mt-4 text-[10px] text-slate-400 font-serif italic">Müellif: Oğuz Bulut & Muavin AI</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
