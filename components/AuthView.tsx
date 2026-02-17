
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
        const user = await loginUser(email, password);
        onLoginSuccess(user);
      } else {
        await registerUser({ email, password, name, studentNo });
        setIsLogin(true);
        setError('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
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
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl sm:rounded-[2rem] text-3xl sm:text-4xl mb-4 sm:mb-6 shadow-2xl">🏛️</div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-slate-900 dark:text-white mb-2 tracking-tight">TarihAsistanım</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">AUZEF Tarih Bölümü Çalışma Portalı</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl sm:rounded-2xl mb-6 sm:mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
            >
              Giriş
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
            >
              Kayıt
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Ad Soyad</label>
                  <input 
                    required
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                    placeholder="Adınız Soyadınız"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Öğrenci No (Opsiyonel)</label>
                  <input 
                    type="text" 
                    value={studentNo}
                    onChange={(e) => setStudentNo(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                    placeholder="230..."
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">E-Posta</label>
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                placeholder="ornek@mail.com"
              />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 px-1">Şifre</label>
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl sm:rounded-2xl px-5 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className={`p-4 rounded-xl text-xs font-bold ${error.includes('başarılı') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] font-black text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50 mt-4"
            >
              {loading ? "Bekleyin..." : (isLogin ? "Giriş Yap →" : "Kayıt Ol →")}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 dark:text-slate-500 text-[10px] mt-8 leading-relaxed max-w-[240px] mx-auto uppercase tracking-wider font-bold">
          Verileriniz tarayıcı belleğinde güvenle saklanır.
        </p>
      </div>
    </div>
  );
};

export default AuthView;