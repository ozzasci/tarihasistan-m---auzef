
import React from 'react';
import { Course, CourseId } from './types';

// AUZEF PDF links are usually dynamic, these are placeholders.
// User can replace these URLs with their actual AUZEF PDF links.
export const COURSES: Course[] = [
  {
    id: CourseId.RUSYA,
    name: "Rusya Tarihi",
    description: "Kievan Rus'tan İmparatorluk Rusya'sına kadar olan süreç.",
    color: "bg-blue-600",
    icon: "🏰",
    pdfUrl: "https://auzefkitap.istanbul.edu.tr/kitap/tarih_lisans_ao/rusya_tarihi.pdf"
  },
  {
    id: CourseId.AKKOYUNLU,
    name: "Akkoyunlu-Karakoyunlu-Safevi",
    description: "Doğu Anadolu, İran ve Kafkasya'daki Türkmen devletleri.",
    color: "bg-emerald-600",
    icon: "⚔️",
    pdfUrl: "https://auzefkitap.istanbul.edu.tr/kitap/tarih_lisans_ao/akkoyunlu_karakoyunlu_safevi.pdf"
  },
  {
    id: CourseId.AVRUPA,
    name: "Avrupa Tarihi",
    description: "Orta Çağ'dan Modern Dönem'e Avrupa siyasi ve sosyal yapısı.",
    color: "bg-amber-600",
    icon: "🌍",
    pdfUrl: "https://auzefkitap.istanbul.edu.tr/kitap/tarih_lisans_ao/avrupa_tarihi.pdf"
  },
  {
    id: CourseId.TURKISTAN,
    name: "Türkistan Tarihi",
    description: "Orta Asya Türk devletleri ve bölgenin jeopolitik önemi.",
    color: "bg-rose-600",
    icon: "🏹",
    pdfUrl: "https://auzefkitap.istanbul.edu.tr/kitap/tarih_lisans_ao/turkistan_tarihi.pdf"
  },
  {
    id: CourseId.MEMLUK,
    name: "Memlük Tarihi",
    description: "Mısır ve Suriye'de hüküm süren Türk-Çerkes sultanlığı.",
    color: "bg-indigo-600",
    icon: "🕌",
    pdfUrl: "https://auzefkitap.istanbul.edu.tr/kitap/tarih_lisans_ao/memluk_tarihi.pdf"
  },
  {
    id: CourseId.ALTINORDA,
    name: "Altınorda Tarihi",
    description: "Cengiz Han'ın torunlarının Deşt-i Kıpçak'taki imparatorluğu.",
    color: "bg-purple-600",
    icon: "🏇",
    pdfUrl: "https://auzefkitap.istanbul.edu.tr/kitap/tarih_lisans_ao/altinorda_tarihi.pdf"
  }
];
