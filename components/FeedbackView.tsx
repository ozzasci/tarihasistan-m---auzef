
import React, { useState } from 'react';
import { motion } from 'motion/react';

interface FeedbackViewProps {
  onBack: () => void;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Geri Bildirim',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simüle edilmiş gönderim süreci
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      console.log('Feedback submitted:', formData);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto px-4 py-12 text-center"
      >
        <div className="w-24 h-24 bg-enderun/10 text-enderun rounded-full flex items-center justify-center text-5xl mx-auto mb-8 border-4 border-enderun/20 border-dashed">📜</div>
        <h2 className="text-3xl font-display font-bold text-hunkar dark:text-altin uppercase tracking-widest mb-4">Arz-ı Haliniz Alındı</h2>
        <p className="text-slate-600 dark:text-orange-50/60 font-serif italic text-lg mb-10 leading-relaxed">
          "Söz gümüşse sükut altındır, lakin haklı kelam her daim baş tacıdır." <br/>
          Değerli fikirleriniz müverrihlerimiz tarafından mütalaa edilecektir. Teşekkür ederiz.
        </p>
        <button 
          onClick={onBack}
          className="bg-hunkar text-altin px-12 py-4 rounded-full font-display font-black text-sm tracking-widest shadow-xl hover:brightness-110 transition-all active:scale-95"
        >
          ANA DİVANA DÖN
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-4 py-8"
    >
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-hunkar dark:text-altin font-display font-bold hover:opacity-70 transition-all group p-2"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Geri
        </button>
        <h1 className="text-2xl font-display font-black text-hunkar dark:text-altin tracking-widest uppercase">Arz-ı Hal (Geri Bildirim)</h1>
      </div>

      <div className="bg-parshmen dark:bg-slate-900 rounded-[3rem] border-4 border-altin shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <svg width="150" height="150" viewBox="0 0 200 200" fill="currentColor" className="text-hunkar">
            <path d="M100 0C100 0 80 40 40 40C40 40 0 60 0 100C0 140 40 160 40 160C40 160 80 200 100 200C100 200 120 160 160 160C160 160 200 140 200 100C200 60 160 40 160 40C160 40 120 0 100 0Z" />
          </svg>
        </div>

        <div className="p-8 sm:p-12">
          <p className="text-enderun dark:text-orange-200/60 font-serif italic text-base mb-8 border-l-4 border-altin pl-4">
            Uygulama hakkındaki mütalaalarınızı, karşılaştığınız müşkülatları veya yeni fikirlerinizi buradan bize ulaştırabilirsiniz.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-display font-black text-hunkar dark:text-altin uppercase tracking-widest ml-2">İsim & Mahlas</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Örn: Müverrih Oğuz"
                  className="w-full bg-white/50 dark:bg-black/20 border-2 border-altin/20 focus:border-altin rounded-2xl px-6 py-4 outline-none transition-all font-serif"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-display font-black text-hunkar dark:text-altin uppercase tracking-widest ml-2">E-Posta Adresi</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="iletisim@vakanuvis.com"
                  className="w-full bg-white/50 dark:bg-black/20 border-2 border-altin/20 focus:border-altin rounded-2xl px-6 py-4 outline-none transition-all font-serif"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-display font-black text-hunkar dark:text-altin uppercase tracking-widest ml-2">Mevzu (Konu)</label>
              <select 
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
                className="w-full bg-white/50 dark:bg-black/20 border-2 border-altin/20 focus:border-altin rounded-2xl px-6 py-4 outline-none transition-all font-serif appearance-none"
              >
                <option value="Geri Bildirim">Geri Bildirim</option>
                <option value="Hata Bildirimi">Hata Bildirimi (Arıza)</option>
                <option value="Öneri">Yeni Özellik Önerisi</option>
                <option value="Teşekkür">Teşekkür & Tebrik</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-display font-black text-hunkar dark:text-altin uppercase tracking-widest ml-2">Kelamınız (Mesajınız)</label>
              <textarea 
                required
                rows={5}
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                placeholder="Fikirlerinizi buraya nakşediniz..."
                className="w-full bg-white/50 dark:bg-black/20 border-2 border-altin/20 focus:border-altin rounded-2xl px-6 py-4 outline-none transition-all font-serif resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-hunkar text-altin py-5 rounded-2xl font-display font-black text-sm tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-110'}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-altin border-t-transparent rounded-full animate-spin"></div>
                  GÖNDERİLİYOR...
                </>
              ) : (
                <>
                  <span className="text-xl">📜</span> ARZ ET (GÖNDER)
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-[10px] font-display font-black text-hunkar/40 dark:text-altin/40 uppercase tracking-[0.4em]">
          Vakanüvis İlim ve Kültür Platformu
        </p>
      </div>
    </motion.div>
  );
};

export default FeedbackView;

