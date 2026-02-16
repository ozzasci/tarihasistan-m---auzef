
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
  const [isMessaging, setIsMessaging] = useState<User | null>(null);
  
  // Form States
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCourse, setNewCourse] = useState<CourseId>(CourseId.RUSYA);
  const [msgContent, setMsgContent] = useState('');

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

  const handleSendMessage = async () => {
    if (!msgContent || !isMessaging) return;
    const msg: DirectMessage = {
      id: Math.random().toString(36).substr(2, 9),
      fromId: user.email,
      fromName: user.name,
      toId: isMessaging.email,
      content: msgContent,
      date: Date.now(),
      isRead: false
    };
    await sendMessage(msg);
    setIsMessaging(null);
    setMsgContent('');
    fetchData();
    alert("Mesaj gönderildi!");
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="text-slate-400 dark:text-slate-500 font-bold hover:text-slate-900 dark:hover:text-white flex items-center gap-2 group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Geri Dön
        </button>
        <h2 className="text-2xl font-serif font-black text-slate-900 dark:text-white">Topluluk Hub</h2>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl mb-8 gap-1">
        {[
          { id: 'feed', label: 'Kaynak Panosu', icon: '📋' },
          { id: 'users', label: 'Öğrenciler', icon: '🎓' },
          { id: 'inbox', label: 'Posta Kutusu', icon: '📬' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeSubTab === tab.id ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'feed' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Paylaşılan Son Kaynaklar</h3>
            <button 
              onClick={() => setIsSharing(true)}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg"
            >
              Kaynak Paylaş +
            </button>
          </div>

          {isSharing && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-900 shadow-xl animate-in zoom-in-95">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input 
                  placeholder="Kaynak Başlığı (Örn: 3. Ünite Özeti)" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select 
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value as CourseId)}
                  className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {COURSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input 
                  placeholder="URL / Drive Linki" 
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="md:col-span-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsSharing(false)} className="px-4 py-2 text-slate-400 text-xs font-bold uppercase">İptal</button>
                <button onClick={handleShare} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-black uppercase shadow-md">Yayınla</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {resources.length === 0 ? (
              <div className="text-center py-20 opacity-40 italic">Henüz paylaşım yapılmamış. İlk sen ol!</div>
            ) : (
              resources.map(res => (
                <div key={res.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-2xl">🔗</div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white leading-tight">{res.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{COURSES.find(c => c.id === res.courseId)?.name}</span>
                        <span className="text-[10px] text-slate-400">• {res.senderName}</span>
                      </div>
                    </div>
                  </div>
                  <a href={res.url} target="_blank" rel="noreferrer" className="bg-slate-900 dark:bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg active:scale-95 transition-all">İncele</a>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'users' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {users.map(u => (
            <div key={u.email} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl overflow-hidden">
                  {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" /> : u.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-white text-sm">{u.name}</div>
                  <div className="text-[10px] text-slate-400">AUZEF 3. Sınıf Öğrencisi</div>
                </div>
              </div>
              <button 
                onClick={() => setIsMessaging(u)}
                className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
              >
                ✉️
              </button>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === 'inbox' && (
        <div className="space-y-4">
          {messages.length === 0 ? (
             <div className="text-center py-20 opacity-40 italic">Gelen kutusu boş.</div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`p-6 rounded-[2rem] border transition-all ${msg.toId === user.email ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800' : 'bg-slate-50 dark:bg-slate-950 border-transparent opacity-70'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-600">{msg.fromId === user.email ? 'SEN' : msg.fromName}</span>
                    <span className="text-[10px] text-slate-400">→ {new Date(msg.date).toLocaleDateString('tr-TR')}</span>
                  </div>
                  {msg.fromId !== user.email && (
                    <button onClick={() => setIsMessaging(users.find(u => u.email === msg.fromId)!)} className="text-[10px] font-black text-indigo-500 uppercase">Yanıtla</button>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">"{msg.content}"</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Messaging Modal */}
      {isMessaging && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95">
             <div className="text-center mb-6">
               <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">✉️</div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">{isMessaging.name} kişisine mesaj gönder</h3>
               <p className="text-xs text-slate-500">Kaynak linki veya notlarınızı paylaşabilirsiniz.</p>
             </div>
             <textarea 
               value={msgContent}
               onChange={(e) => setMsgContent(e.target.value)}
               placeholder="Mesajınızı buraya yazın..."
               className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 mb-6 resize-none"
             />
             <div className="flex gap-2">
               <button onClick={() => setIsMessaging(null)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Vazgeç</button>
               <button onClick={handleSendMessage} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg">Gönder →</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityView;
