
import React, { useState, useEffect } from 'react';
import { User, SharedResource, DirectMessage, CourseId } from '../types';
import { COURSES } from '../constants';
import { 
  getSharedResources, 
  shareResource, 
  getAllUsers, 
  sendMessage, 
  getMyMessages 
} from '../services/dbService';

interface CommunityViewProps {
  user: User;
  onBack: () => void;
}

const CommunityView: React.FC<CommunityViewProps> = ({ user, onBack }) => {
  const [activeSubTab, setActiveSubTab] = useState<'feed' | 'users' | 'inbox'>('feed');
  const [resources, setResources] = useState<SharedResource[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importCode, setImportCode] = useState('');
  
  // Form States
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCourse, setNewCourse] = useState<CourseId>(CourseId.RUSYA);

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  const fetchData = async () => {
    const res = await getSharedResources();
    setResources(res.sort((a, b) => b.date - a.date));
    const allUsers = await getAllUsers();
    setUsers(allUsers.filter(u => u.email !== user.email));
    const myMsgs = await getMyMessages(user.email);
    setMessages(myMsgs.sort((a, b) => b.date - a.date));
  };

  const handleShare = async () => {
    if (!newTitle || !newUrl) return;
    const resource: SharedResource = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle,
      type: 'link',
      courseId: newCourse,
      url: newUrl,
      senderName: user.name,
      senderId: user.email,
      date: Date.now(),
      description: ''
    };
    await shareResource(resource);
    setIsSharing(false);
    setNewTitle('');
    setNewUrl('');
    fetchData();
  };

  const handleImport = async () => {
    try {
      const decoded = JSON.parse(atob(importCode));
      if (decoded.title && decoded.url) {
        await shareResource({
          ...decoded,
          id: Math.random().toString(36).substr(2, 9),
          date: Date.now()
        });
        setImportCode('');
        setIsImporting(false);
        fetchData();
        alert("Ferman başarıyla ithal edildi!");
      }
    } catch (e) {
      alert("Geçersiz ferman kodu! Lütfen kodu doğru kopyaladığınızdan emin olun.");
    }
  };

  const copyExportCode = (res: SharedResource) => {
    const code = btoa(JSON.stringify(res));
    navigator.clipboard.writeText(code);
    alert("Paylaşım kodu kopyalandı! Arkadaşınıza göndererek bu kaynağı onun mahzenine eklemesini sağlayabilirsiniz.");
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="text-hunkar dark:text-altin font-display font-bold hover:opacity-70 flex items-center gap-2 group p-2">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Geri Dön
        </button>
        <h2 className="text-3xl font-display font-black text-hunkar dark:text-altin uppercase tracking-widest">Meclis-i İrfan</h2>
      </div>

      <div className="flex bg-white/40 dark:bg-black/20 p-1.5 rounded-2xl mb-8 gap-1 border-2 border-altin/20 shadow-inner">
        {[
          { id: 'feed', label: 'Havadis-i Bilgi', icon: '📜' },
          { id: 'users', label: 'Talebeler', icon: '🎓' },
          { id: 'inbox', label: 'Mektuplaşma', icon: '📬' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-display font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeSubTab === tab.id ? 'bg-hunkar text-white shadow-xl' : 'text-hunkar/40 dark:text-altin/40 hover:bg-white/20'}`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'feed' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-display font-bold text-hunkar dark:text-altin uppercase">Bilgi Paylaşım Divanı</h3>
            <div className="flex gap-2 w-full sm:w-auto">
               <button 
                onClick={() => setIsImporting(true)}
                className="flex-1 sm:flex-none bg-altin text-hunkar px-6 py-3 rounded-xl font-display font-black text-[10px] uppercase shadow-lg border border-white/50"
              >
                📥 FERMAN İTHAL ET
              </button>
              <button 
                onClick={() => setIsSharing(true)}
                className="flex-1 sm:flex-none bg-hunkar text-altin px-6 py-3 rounded-xl font-display font-black text-[10px] uppercase shadow-lg border border-altin"
              >
                ➕ KAYNAK EKLE
              </button>
            </div>
          </div>

          {isImporting && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-4 border-altin shadow-2xl animate-in zoom-in-95">
               <h4 className="text-lg font-display font-black text-hunkar dark:text-altin mb-4">📜 FERMAN KODUNU YAPIŞTIR</h4>
               <textarea 
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="Arkadaşınızdan gelen paylaşım kodunu buraya yapıştırın..."
                className="w-full h-32 bg-parshmen dark:bg-slate-800 border-2 border-altin/20 rounded-2xl p-4 text-sm font-mono dark:text-white outline-none focus:border-altin mb-4"
               />
               <div className="flex justify-end gap-3">
                  <button onClick={() => setIsImporting(false)} className="px-6 py-2 text-slate-400 font-display font-bold text-[10px]">VAZGEÇ</button>
                  <button onClick={handleImport} className="bg-hunkar text-altin px-10 py-3 rounded-xl font-display font-black text-[10px] shadow-xl">MAHZENE EKLE</button>
               </div>
            </div>
          )}

          {isSharing && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-4 border-altin shadow-2xl animate-in zoom-in-95">
              <h4 className="text-lg font-display font-black text-hunkar dark:text-altin mb-6">🖋️ YENİ FERMAN TAHRİRİ</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input 
                  placeholder="Kaynak Başlığı (Örn: 3. Ünite Özeti)" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-parshmen dark:bg-slate-800 border-2 border-altin/10 rounded-xl px-4 py-4 text-sm dark:text-white outline-none focus:border-altin"
                />
                <select 
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value as CourseId)}
                  className="bg-parshmen dark:bg-slate-800 border-2 border-altin/10 rounded-xl px-4 py-4 text-sm dark:text-white outline-none focus:border-altin"
                >
                  {COURSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input 
                  placeholder="URL / Drive Linki" 
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="md:col-span-2 bg-parshmen dark:bg-slate-800 border-2 border-altin/10 rounded-xl px-4 py-4 text-sm dark:text-white outline-none focus:border-altin"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsSharing(false)} className="px-6 py-2 text-slate-400 font-display font-bold text-[10px]">İPTAL</button>
                <button onClick={handleShare} className="bg-hunkar text-altin px-10 py-3 rounded-xl font-display font-black text-[10px] shadow-xl">DİVANDA PAYLAŞ</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {resources.length === 0 ? (
              <div className="text-center py-20 bg-white/20 rounded-[3rem] border-4 border-dashed border-altin/20">
                <div className="text-6xl mb-4 opacity-20">📜</div>
                <p className="font-serif italic text-slate-400">Bu divanda henüz bir kelam edilmemiş.</p>
              </div>
            ) : (
              resources.map(res => (
                <div key={res.id} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-t-4 border-altin shadow-xl group hover:shadow-2xl transition-all rumi-border relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-hunkar/5 dark:bg-altin/5 flex items-center justify-center text-3xl border border-altin/20">🔗</div>
                      <div>
                        <h4 className="font-display font-black text-hunkar dark:text-altin text-lg leading-tight uppercase tracking-wider">{res.title}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[9px] font-black bg-altin/20 text-hunkar px-2 py-0.5 rounded-full uppercase tracking-widest">{COURSES.find(c => c.id === res.courseId)?.name}</span>
                          <span className="text-[9px] text-slate-400 font-serif italic">Müellif: {res.senderName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => copyExportCode(res)}
                        className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-4 py-3 rounded-xl text-[9px] font-display font-black uppercase tracking-widest hover:bg-altin hover:text-hunkar transition-all"
                      >
                        Kodu Al 📋
                      </button>
                      <a href={res.url} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none bg-hunkar text-altin px-8 py-3 rounded-xl text-[10px] font-display font-black uppercase tracking-widest shadow-lg text-center">İncele →</a>
                    </div>
                  </div>
                  <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] text-8xl pointer-events-none">📜</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Talebeler ve Mektuplaşma sekmeleri dbService üzerinden local olarak çalışmaya devam eder */}
      {activeSubTab === 'users' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <p className="col-span-full text-center text-slate-400 font-serif italic mb-4">Bu cihazda kayıtlı diğer talebeler:</p>
          {users.map(u => (
            <div key={u.email} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-hunkar text-altin flex items-center justify-center text-2xl overflow-hidden border-2 border-altin">
                  {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" /> : u.name.charAt(0)}
                </div>
                <div>
                  <div className="font-display font-bold text-hunkar dark:text-altin text-sm uppercase">{u.name}</div>
                  <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest">AUZEF Talebesi</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {activeSubTab === 'inbox' && (
        <div className="text-center py-20 bg-white/20 rounded-[3rem] border-4 border-dashed border-altin/20">
          <div className="text-6xl mb-4 opacity-20">📬</div>
          <h3 className="text-xl font-display font-black text-hunkar dark:text-altin uppercase">Haberleşme Odası</h3>
          <p className="text-sm text-slate-400 font-serif italic mt-4 max-w-sm mx-auto">
            Bu bölüm, aynı cihazı kullanan farklı kullanıcılar arası mesajlaşma içindir. Genel ağ üzerinden mesajlaşma ileride eklenecektir.
          </p>
        </div>
      )}
    </div>
  );
};

export default CommunityView;
