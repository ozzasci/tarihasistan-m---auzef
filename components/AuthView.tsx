
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
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-900 text-white rounded-[2rem] text-4xl mb-6 shadow-2xl">🏛️</div>
          <h1 className="text-4xl font-serif font-black text-slate-900 mb-2">TarihAsistanım</h1>
          <p className="text-slate-500 font-medium">AUZEF Tarih Bölümü Çalışma Portalı</p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
            >
              Giriş Yap
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
            >
              Kayıt Ol
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Ad Soyad</label>
                  <input 
                    required
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Adınız Soyadınız"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Öğrenci No (Opsiyonel)</label>
                  <input 
                    type="text" 
                    value={studentNo}
                    onChange={(e) => setStudentNo(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="230..."
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">E-Posta Adresi</label>
              <input 
                required
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="ornek@mail.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Şifre</label>
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
              className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-sm shadow-xl shadow-slate-200 active:scale-95 transition-all disabled:opacity-50 mt-4"
            >
              {loading ? "İşlem yapılıyor..." : (isLogin ? "Giriş Yap →" : "Kayıt Ol →")}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-xs mt-10 leading-relaxed max-w-[280px] mx-auto">
          Tüm verileriniz tarayıcınızın güvenli belleğinde saklanır ve asla dışarı aktarılmaz.
        </p>
      </div>
    </div>
  );
};

export default AuthView;
