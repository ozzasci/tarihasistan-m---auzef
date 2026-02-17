import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { StudySummary, QuizQuestion, Flashcard, RulerNode, ComparisonResult, WeeklyPlan, DayAvailability } from "../types";

// --- KONFİGÜRASYON ---
// Vite projelerinde tarayıcı güvenliği için VITE_ ön eki zorunludur.
const getAIModel = (modelName: string = "gemini-1.5-flash", systemInstruction?: string) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("HATA: VITE_GEMINI_API_KEY bulunamadı! Vercel Ayarlarını kontrol edin.");
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ 
    model: modelName,
    systemInstruction: systemInstruction 
  });
};

const handleAIError = (error: any) => {
  console.error("AI API Hatası:", error);
  throw error;
};

// --- SERVİS FONKSİYONLARI ---

export const generateWeeklyPlan = async (studentName: string, courses: string[], availability: DayAvailability[]): Promise<WeeklyPlan> => {
  const model = getAIModel();
  if (!model) throw new Error("AI başlatılamadı");
  
  const availabilityString = availability
    .filter(a => a.slots.length > 0)
    .map(a => `${a.day}: ${a.slots.join(', ')} saatlerinde müsaidim.`)
    .join('\n');

  const prompt = `Öğrenci ${studentName} için şu dersleri içeren bir haftalık AUZEF Tarih çalışma programı hazırlamanı istiyorum: ${courses.join(', ')}. 
      KRİTİK KISITLAMA: Programı SADECE bu saatlere yerleştir: ${availabilityString}
      JSON formatında 'sessions' ve 'advice' döndür.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text().replace(/```json|```/g, ""));
  } catch (err) {
    return handleAIError(err);
  }
};

export const compareHistory = async (entity1: string, entity2: string): Promise<ComparisonResult> => {
  const model = getAIModel();
  if (!model) throw new Error("AI başlatılamadı");
  const prompt = `"${entity1}" ve "${entity2}" yapılarını; askeri, siyasi ve ekonomik açılardan karşılaştır. JSON formatında döndür.`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text().replace(/```json|```/g, ""));
  } catch (err) {
    return handleAIError(err);
  }
};

export const generateSummary = async (courseName: string): Promise<StudySummary> => {
  const model = getAIModel();
  if (!model) throw new Error("AI başlatılamadı");
  const prompt = `AUZEF Tarih 3. Sınıf müfredatına uygun "${courseName}" dersi için akademik özet hazırla. JSON döndür.`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text().replace(/```json|```/g, ""));
  } catch (err) {
    return handleAIError(err);
  }
};

export const chatWithTutor = async (courseName: string, history: any[]): Promise<string | undefined> => {
  // Chat asistanı için sistem talimatını model başlatılırken veriyoruz
  const model = getAIModel("gemini-1.5-flash", `Sen bir AUZEF Tarih Bölümü 3. sınıf asistanısın. Ders: ${courseName}.`);
  if (!model) throw new Error("AI başlatılamadı");
  
  try {
    const result = await model.generateContent({ contents: history });
    const response = await result.response;
    return response.text();
  } catch (err) {
    return handleAIError(err);
  }
};

export const interviewCharacter = async (characterName: string, characterTitle: string, history: any[]): Promise<string | undefined> => {
  const model = getAIModel("gemini-1.5-flash", `Sen ${characterName} (${characterTitle}) isminde tarihi bir karaktersin.`);
  if (!model) throw new Error("AI başlatılamadı");
  try {
    const result = await model.generateContent({ contents: history });
    const response = await result.response;
    return response.text();
  } catch (err) {
    return handleAIError(err);
  }
};

// Diğer fonksiyonlar (Quiz, Genealogy vb.) benzer şekilde gemini-1.5-flash modeline güncellenmelidir.
