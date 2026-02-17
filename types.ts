
export enum CourseId {
  RUSYA = 'rusya-tarihi',
  AKKOYUNLU = 'akkoyunlu-karakoyunlu-safevi',
  AVRUPA = 'avrupa-tarihi',
  TURKISTAN = 'turkistan-tarihi',
  MEMLUK = 'memluk-tarihi',
  ALTINORDA = 'altinorda-tarihi'
}

export interface Unit {
  number: number;
  title: string;
  isUploaded: boolean;
  isCompleted: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  studentNo?: string;
  avatarUrl?: string;
  createdAt: number;
}

export interface DayAvailability {
  day: string;
  slots: string[];
}

export interface StudySession {
  day: string;
  time: string;
  courseName: string;
  topic: string;
  duration: string;
  type: 'review' | 'focus' | 'quiz';
}

export interface WeeklyPlan {
  sessions: StudySession[];
  advice: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'academic' | 'social' | 'archival' | 'course';
  courseId?: CourseId;
  isUnlocked: boolean;
}

export interface Course {
  id: CourseId;
  name: string;
  description: string;
  color: string;
  icon: string;
  pdfUrl?: string;
  progress?: number;
  featuredCharacter?: HistoryCharacter;
  units?: Unit[]; // Her ders için ünite listesi
}

export interface HistoryCharacter {
  name: string;
  title: string;
  avatar: string;
  description: string;
}

export interface Term {
  word: string;
  meaning: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  groundingLinks?: { title: string, url: string }[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface StudySummary {
  title: string;
  content: string;
  keyDates: { date: string; event: string }[];
  importantFigures: { name: string; role: string }[];
}

export interface ComparisonResult {
  entities: string[];
  aspects: {
    title: string;
    entity1Info: string;
    entity2Info: string;
  }[];
  conclusion: string;
}

export interface RulerNode {
  name: string;
  period: string;
  keyAction: string;
}

export interface SharedResource {
  id: string;
  title: string;
  type: 'link' | 'pdf' | 'text';
  courseId: CourseId;
  url: string;
  senderName: string;
  senderId: string;
  date: number;
  description: string;
}

export interface DirectMessage {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  content: string;
  date: number;
  isRead: boolean;
}
