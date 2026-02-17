
import React from 'react';

interface LinkItem {
  title: string;
  url: string;
  category: 'auzef' | 'archive' | 'library';
  description: string;
  icon: string;
}

const LINKS: LinkItem[] = [
  { title: "AKSİS", url: "https://aksis.istanbul.edu.tr", category: 'auzef', description: "Öğrenci otomasyon sistemi ve ders notları.", icon: "🔑" },
  { title: "AUZEF Çözüm Merkezi", url: "https://auzefcozum.istanbul.edu.tr", category: 'auzef', description: "Talep ve destek başvuruları.", icon: "✉️" },
  { title: "AUZEF Kitap", url: "https://auzefkitap.istanbul.edu.tr", category: 'auzef', description: "Ders kitaplarının dijital nüshaları.", icon: "📚" },
  { title: "Akademik Takvim", url: "https://auzef.istanbul.edu.tr/tr/content/egitim/akademik-takvim", category: 'auzef', description: "2024-2025 Eğitim-Öğretim yılı resmi sınav takvimi.", icon: "📅" },
  { title: "Sınav Kılavuzu", url: "https://auzef.istanbul.edu.tr/tr/content/sinavlar/sinav-kilavuzu", category: 'auzef', description: "Sınav uygulama esasları ve kuralları.", icon: "📋" },
  { title: "Devlet Arşivleri", url: "https://www.devletarsivleri.gov.tr", category: 'archive', description: "Cumhurbaşkanlığı Osmanlı ve Cumhuriyet Arşivi.", icon: "📜" },
  { title: "Türk Tarih Kurumu", url: "https://www.ttk.gov.tr", category: 'archive', description: "Resmi tarih kurumu ve yayınları.", icon: "🏛️" },
  { title: "Yazma Eserler Kurumu", url: "https://www.yek.gov.tr", category: 'archive', description: "El yazması eserlerin dijital arşivi.", icon: "✒️" },
  { title: "TDV İslam Ansiklopedisi", url: "https://islamansiklopedisi.org.tr", category: 'library', description: "Akademik tarih ve din araştırmaları merkezi.", icon: "📖" },
  { title: "YÖK Tez Merkezi", url: "https://tez.yok.gov.tr", category: 'library', description: "Lisansüstü akademik tez arama motoru.", icon: "🎓" },
  { title: "Milli Kütüphane", url: "https://www.millikutuphane.gov.tr", category: 'library', description: "Türkiye'nin hafızası ve dijital kütüphanesi.", icon: "🏛️" }
];

const UsefulLinksView: React.FC<{onBack: () => void}> = ({ onBack }) => {
  const categories = [
    { id: 'auzef', title: "Bab-ı AUZEF (Üniversite)", color: "border-selcuk" },
    { id: 'archive', title: "Hazine-i Evrak (Arşivler)", color: "border-hunkar" },
    { id: 'library', title: "Kütüb-i Amire (Kütüphaneler)", color: "border-enderun" }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 px-4 pb-20">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={onBack} className="text-hunkar dark:text-altin font-display font-bold hover:opacity-70 transition-all group p-2">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Geri
        </button>
        <h2 className="text-3xl font-display font-bold text-hunkar dark:text-altin tracking-widest uppercase">Mecmua-i Link</h2>
      </div>

      <div className="space-y-12">
        {categories.map(cat => (
          <div key={cat.id} className="space-y-6">
            <h3 className={`text-xl font-display font-black text-slate-800 dark:text-altin/80 border-l-8 ${cat.color} pl-4 uppercase tracking-widest`}>
              {cat.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LINKS.filter(l => l.category === cat.id).map((link, i) => (
                <a 
                  key={i} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/80 dark:bg-black/30 p-6 rounded-[2rem] border-2 border-altin/10 hover:border-altin shadow-lg transition-all group active:scale-95 flex items-start gap-4 rumi-border"
                >
                  <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">{link.icon}</div>
                  <div>
                    <h4 className="font-display font-bold text-hunkar dark:text-altin group-hover:underline">{link.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-orange-50/50 font-serif italic mt-1 leading-relaxed">{link.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 bg-parshmen dark:bg-slate-900/60 rounded-[3rem] border-2 border-altin/20 text-center">
        <p className="text-sm text-hunkar dark:text-altin font-serif italic">
          "İlim, paylaşıldıkça çoğalan bir hazinedir." <br/>
          Akademik araştırmalarınızda bu kaynaklar, birincil referans noktanız olmalıdır.
        </p>
      </div>
    </div>
  );
};

export default UsefulLinksView;
