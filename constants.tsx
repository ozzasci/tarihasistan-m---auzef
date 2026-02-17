
import { Course, CourseId, Term } from './types';

export const COURSES: Course[] = [
  {
    id: CourseId.RUSYA,
    name: "Rusya Tarihi",
    description: "Kievan Rus'tan İmparatorluk Rusya'sına kadar olan süreç.",
    color: "bg-blue-600",
    icon: "🏰",
    pdfUrl: "https://auzefkitap.istanbul.edu.tr/kitap/tarih_lisans_ao/rusya_tarihi.pdf",
    videoUrl: "https://www.youtube.com/embed/videoseries?list=PLpAasR1v7r9NidV8Tq_6o3fXm23-O3Y4U", // Örnek AUZEF Rusya Listesi
    featuredCharacter: {
      name: "IV. İvan",
      title: "Rus Çarı (Korkunç İvan)",
      avatar: "👑",
      description: "Rus Çarlığı'nın kuruluş süreci ve merkeziyetçi reformlar hakkında konuşun."
    }
  },
  {
    id: CourseId.AKKOYUNLU,
    name: "Akkoyunlu-Karakoyunlu-Safevi",
    description: "Doğu Anadolu, İran ve Kafkasya'daki Türkmen devletleri.",
    color: "bg-emerald-600",
    icon: "⚔️",
    pdfUrl: "https://auzefkitap.istanbul.edu.tr/kitap/tarih_lisans_ao/akkoyunlu_karakoyunlu_safevi.pdf",
    videoUrl: "https://www.youtube.com/embed/videoseries?list=PLpAasR1v7r9PvM0C29vNf_tBwK9iI5-k-",
    featuredCharacter: {
      name: "Şah İsmail",
      title: "Safevi Devleti Kurucusu",
      avatar: "🗡️",
      description: "Safevi devletinin kuruluşu ve Çaldıran süreci üzerine mülakat yapın."
    }
  },
  {
    id: CourseId.AVRUPA,
    name: "Avrupa Tarihi",
    description: "Orta Çağ'dan Modern Dönem'e Avrupa siyasi ve sosyal yapısı.",
    color: "bg-amber-600",
    icon: "🌍",
    pdfUrl: "https://auzefkitap.istanbul.edu.tr/kitap/tarih_lisans_ao/avrupa_tarihi.pdf",
    videoUrl: "https://www.youtube.com/embed/videoseries?list=PLpAasR1v7r9M9t6zV9h6yS_q6-F7XvB2J",
    featuredCharacter: {
      name: "V. Charles",
      title: "Kutsal Roma İmparatoru",
      avatar: "⚜️",
      description: "Reform dönemi ve Avrupa'daki Habsburg hakimiyeti üzerine konuşun."
    }
  },
  {
    id: CourseId.TURKISTAN,
    name: "Türkistan Tarihi",
    description: "Orta Asya Türk devletleri ve bölgenin jeopolitik önemi.",
    color: "bg-rose-600",
    icon: "🏹",
    pdfUrl: "https://auzefkitap.istanbul.edu.tr/kitap/tarih_lisans_ao/turkistan_tarihi.pdf",
    videoUrl: "https://www.youtube.com/embed/videoseries?list=PLpAasR1v7r9O5xV9NidV8Tq_6o3fXm23-O",
    featuredCharacter: {
      name: "Emir Timur",
      title: "Timurlu İmparatorluğu Sultanı",
      avatar: "🐎",
      description: "Semerkand merkezli büyük imparatorluk ve seferler hakkında bilgi alın."
    }
  },
  {
    id: CourseId.MEMLUK,
    name: "Memlük Tarihi",
    description: "Mısır ve Suriye'de hüküm süren Türk-Çerkes sultanlığı.",
    color: "bg-indigo-600",
    icon: "🕌",
    pdfUrl: "https://auzefkitap.istanbul.edu.tr/kitap/tarih_lisans_ao/memluk_tarihi.pdf",
    videoUrl: "https://www.youtube.com/embed/videoseries?list=PLpAasR1v7r9P0xV9NidV8Tq_6o3fXm23-O",
    featuredCharacter: {
      name: "Sultan Baybars",
      title: "Memlük Sultanı",
      avatar: "🦁",
      description: "Moğol durduruluşu ve Memlük askeri sistemi üzerine söyleşi yapın."
    }
  },
  {
    id: CourseId.ALTINORDA,
    name: "Altınorda Tarihi",
    description: "Cengiz Han'ın torunlarının Deşt-i Kıpçak'taki imparatorluğu.",
    color: "bg-purple-600",
    icon: "🏇",
    pdfUrl: "https://auzefkitap.istanbul.edu.tr/kitap/tarih_lisans_ao/altinorda_tarihi.pdf",
    videoUrl: "https://www.youtube.com/embed/videoseries?list=PLpAasR1v7r9R1xV9NidV8Tq_6o3fXm23-O",
    featuredCharacter: {
      name: "Toktamış Han",
      title: "Altınorda Hanı",
      avatar: "🦅",
      description: "Büyük Bozkır'daki egemenlik savaşları ve Moskova seferi üzerine mülakat."
    }
  }
];

export const INITIAL_GLOSSARY: Term[] = [
  { word: "İltizam", meaning: "Osmanlı ve İslam devletlerinde vergi toplama hakkının ihale ile satılması sistemi." },
  { word: "Knezlik", meaning: "Rus tarihinde Prensliğe verilen isim, yönetim birimi." },
  { word: "Soyurgal", meaning: "Safevi ve Akkoyunlularda görülen bir tür toprak bağışı ve muafiyet hakkı." },
  { word: "Yarlık", meaning: "Moğol ve Türk devletlerinde hanların verdiği resmi emir veya ferman." },
  { word: "Deşt-i Kıpçak", meaning: "Hazar Denizi'nin kuzeyinden Orta Asya'ya kadar uzanan Kıpçak bozkırı." },
  { word: "Atabey", meaning: "Selçuklu ve ardılı devletlerde şehzadelerin eğitimiyle görevli kıdemli komutan." }
];
