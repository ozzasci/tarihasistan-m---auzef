
export enum CourseId {
  RUSYA = 'rusya-tarihi',
  AKKOYUNLU = 'akkoyunlu-karakoyunlu-safevi',
  AVRUPA = 'avrupa-tarihi',
  TURKISTAN = 'turkistan-tarihi',
  MEMLUK = 'memluk-tarihi',
  ALTINORDA = 'altinorda-tarihi'
}

export interface Course {
  id: CourseId;
  name: string;
  description: string;
  color: string;
  icon: string;
  pdfUrl?: string; // Optional field for PDF links
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
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
