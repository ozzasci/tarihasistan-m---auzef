
import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/dbService';

interface AuthViewProps {
  onLoginSuccess: (user: any) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [studentNo, setStudentNo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    setLoading(true);

    try {
      if (isLogin) {
        const user = await loginUser(email.toLowerCase(), password);
        onLoginSuccess(user);
      } else {
        // Yeni talebe kaydı
        await registerUser({ 
          email: email.toLowerCase(), 
          password, 
          name, 
          studentNo,
          avatarUrl: '' 
        });
        setIsLogin(true);
        setError('Kayıt başarılı! Şimdi divana giriş yapabilirsiniz.');
        // Kayıt sonrası alanları temizle
        setName('');
        setStudentNo('');
      }
    } catch (err: any) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans pt-safe pb-safe">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-hunkar text-altin rounded-2xl sm:rounded-[2rem] text-3xl sm:text-4xl mb-4 sm:mb-6 shadow-2xl border-2 border-altin">🏛️</div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-hunkar dark:text-altin mb-2 tracking-widest uppercase">Vakanüvis</h1>
          <p className="text-slate-500 dark:text-slate-400 font-serif italic text-sm">AUZEF Tarih Bölümü Talebe Portalı</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3">
             <span className="text-[8px] font-black bg-altin/20 text-hunkar px-2 py-1 rounded-full uppercase tracking-tighter">Akademik Erişim</span>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
            <button 
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
            >
              Giriş
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
            >
              Kayıt
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">İsim Soyisim</label>
                    <input 
                      required
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-hunkar outline-none transition-all dark:text-white"
                      placeholder="Adınız Soyadınız"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Öğrenci No (İsteğe Bağlı)</label>
                    <input 
                      type="text" 
                      value={studentNo}
                      onChange={(e) => setStudentNo(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-hunkar outline-none transition-all dark:text-white"
                      placeholder="230101..."
                    />
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">E-Posta Adresi</label>
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-hunkar outline-none transition-all dark:text-white"
                placeholder="ornek@mail.com"
              />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Parola</label>
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-hunkar outline-none transition-all dark:text-white"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className={`p-4 rounded-xl text-xs font-bold border-2 animate-in slide-in-from-top-2 ${error.includes('başarılı') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-hunkar text-altin py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] font-display font-black text-sm tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50 mt-4 border-2 border-altin"
            >
              {loading ? "BEKLEYİN..." : (isLogin ? "DİVANA GİRİŞ →" : "DEFTERE KAYDOL →")}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 dark:text-slate-500 text-[10px] mt-8 leading-relaxed max-w-[240px] mx-auto uppercase tracking-wider font-bold">
          Verileriniz tamamen bu cihazda mühürlü kalır, harici sunuculara gönderilmez.
        </p>
      </div>
    </div>
  );
};

export default AuthView;
