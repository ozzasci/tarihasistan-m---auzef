
import React, { useState, useEffect } from 'react';
import { getAllPDFs } from '../services/dbService';

interface SettingsViewProps {
  onBack: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

// Fixed: Removed local declaration of Window.aistudio to avoid conflict with existing AIStudio type definition in the environment.

const SettingsView: React.FC<SettingsViewProps> = ({ onBack, theme, onToggleTheme }) => {
  const [notifExam, setNotifExam] = useState(true);
  const [notifStudy, setNotifStudy] = useState(false);
  const [storageSize, setStorageSize] = useState('0 MB');
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      // Fixed: Access aistudio via type assertion to window to avoid TypeScript property conflict or missing property errors.
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const hasKey = await aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();

    const calcStorage = async () => {
      const pdfs = await getAllPDFs();
      let total = 0;
      pdfs.forEach(p => total += p.blob.size);
      setStorageSize((total / (1024 * 1024)).toFixed(1) + ' MB');
    };
    calcStorage();
  }, []);

  const handleSelectKey = async () => {
    // Fixed: Use type assertion to access aistudio on window.
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      // Yarış durumunu önlemek için seçimin başarılı olduğunu varsayıyoruz
      setHasApiKey(true);
    }
  };

  const handleClearData = () => {
    if (window.confirm("Tüm ders ilerlemeleriniz ve notlarınız silinecektir. Bu işlem geri alınamaz. Emin misiniz?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="text-slate-400 dark:text-slate-500 font-bold hover:text-slate-900 dark:hover:text-white flex items-center gap-2 group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Geri Dön
        </button>
        <h2 className="text-2xl font-serif font-black text-slate-900 dark:text-white">Uygulama Ayarları</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Yapay Zeka Config Section */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span>🤖</span> Yapay Zeka Yapılandırması
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">API Durumu</span>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full ${hasApiKey ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    {hasApiKey ? 'AKTİF' : 'ANAHTAR BEKLENİYOR'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                  Yapay zeka özelliklerini (Soru-Cevap, Analiz, Karakter Mülakatı) kullanmak için kendi API anahtarınızı bağlayabilirsiniz.
                </p>
                <button 
                  onClick={handleSelectKey}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
                >
                  {hasApiKey ? 'Anahtarı Değiştir / Güncelle' : 'Kendi API Anahtarını Bağla'}
                </button>
                <div className="mt-4 text-center">
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] text-indigo-500 hover:underline font-bold"
                  >
                    API Faturalandırma ve Ücretlendirme Hakkında Bilgi Al ↗
                  </a>
                </div>
              </div>
            </div>
          </div>

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
             <button 
              onClick={handleClearData}
              className="w-full py-4 text-xs font-black uppercase tracking-widest text-rose-500 bg-rose-50 dark:bg-rose-950/20 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"
             >
               ⚠️ Tüm Verileri Sıfırla
             </button>
          </div>
        </div>

        {/* Support Corner */}
        <div className="space-y-6">
          <div className="bg-indigo-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <h3 className="text-xl font-serif font-bold mb-4 relative z-10 flex items-center gap-3">
              <span>💎</span> Destek ve İletişim
            </h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-8 relative z-10 opacity-90 italic">
              "Bu uygulama AUZEF Tarih öğrencilerinin çalışma sürecini modernize etmek için tasarlanmıştır. Teknik destek için resmi kanallarımıza katılabilirsiniz."
            </p>
            
            <div className="space-y-3 relative z-10">
              <a 
                href="https://t.me/vakanuvis_ders_sistemi" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📢</span>
                  <div className="text-sm font-bold">Resmi Bilgi Paylaşım Kanalı</div>
                </div>
                <span className="text-xs font-black opacity-40 group-hover:opacity-100 transition-opacity">KATIL →</span>
              </a>

              <a 
                href="https://t.me/a_OLt1ZGIa/23312" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏹</span>
                  <div className="text-sm font-bold">3. Sınıf Çalışma Grubu</div>
                </div>
                <span className="text-xs font-black opacity-40 group-hover:opacity-100 transition-opacity">KATIL →</span>
              </a>

              <a 
                href="https://t.me/+he-1RZGOuJsyNDI0" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🛡️</span>
                  <div className="text-sm font-bold">Uygulama Destek Hattı</div>
                </div>
                <span className="text-xs font-black opacity-40 group-hover:opacity-100 transition-opacity">KATIL →</span>
              </a>
            </div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-[2.5rem] text-center">
            <div className="text-3xl mb-4">🚀</div>
            <div className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Versiyon</div>
            <div className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">v2.1.0 Pro Edition</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
