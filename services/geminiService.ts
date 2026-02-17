
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StudySummary, QuizQuestion, Flashcard, RulerNode, ComparisonResult, WeeklyPlan, DayAvailability } from "../types";

const ACADEMIC_SYSTEM_INSTRUCTION = "Sen uzman bir AUZEF Tarih akademisyenisin. Öğrenci Oğuz'a 3. sınıf bahar dönemi derslerinde asistanlık yapıyorsun. Cevaplarını verirken sadece genel bilgi verme; ders notlarındaki akademik terminolojiyi kullan ve sınavda çıkabilecek kritik tarihlere vurgu yap. Daima öğrencinin elindeki AUZEF ders kitabına sadık kalarak, akademik ciddiyetle cevap ver.";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

const DEFAULT_MODEL = "gemini-3-flash-preview";
const PRO_MODEL = "gemini-3-pro-preview";
const MAPS_MODEL = "gemini-2.5-flash";
const TTS_MODEL = "gemini-2.5-flash-preview-tts";

const handleAIError = (error: any) => {
  console.error("AI API Hatası:", error);
  throw error;
};

export const fetchAuzefNews = async (): Promise<string[]> => {
  const ai = getAI();
  if (!ai) return [];
  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: "İstanbul Üniversitesi AUZEF 2025-2026 Eğitim-Öğretim yılı akademik takvimini (Kayıt yenileme, Güz ve Bahar sınavları) araştır ve en güncel tarihleri kısa başlıklar halinde ver.",
      config: {
        systemInstruction: "Sen bir akademik asistansın. Sadece resmi auzef.istanbul.edu.tr verilerini kullan. 2025 ve 2026 yıllarına ait en güncel sınav ve kayıt tarihlerini kesin olarak ver. Her haberin başına ilgili bir emoji ekle.",
        tools: [{ googleSearch: {} }]
      }
    });
    const news = response.text?.split('\n').filter(line => line.trim().length > 10).map(line => line.replace(/^\d+\.\s*/, '').trim()) || [];
    return news.length > 0 ? news : [
      "📢 2025-2026 GÜZ DÖNEMİ KAYIT YENİLEME: EYLÜL 2025",
      "📜 GÜZ DÖNEMİ ARA SINAVLARI (VİZE): KASIM 2025",
      "🎓 GÜZ DÖNEMİ FİNAL SINAVLARI: OCAK 2026",
      "🏛️ BAHAR DÖNEMİ VİZE SINAVLARI: NİSAN 2026"
    ];
  } catch (err) {
    return [
      "⚠️ CANLI TAKVİM ALINAMADI: LÜTFEN 2025-2026 RESMİ SİTESİNİ KONTROL EDİNİZ.",
      "🎓 TAHMİNİ FİNAL: HAZİRAN 2026"
    ];
  }
};

export const generateSummary = async (courseName: string, pdfBase64?: string): Promise<StudySummary> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");
  const parts: any[] = [{ text: `AUZEF Tarih 3. Sınıf müfredatına uygun olarak "${courseName}" dersi için detaylı bir akademik özet hazırla. Ayrıca bu üniteyi en iyi anlatan, ünite içinde geçen veya üniteyle ilişkili bir özlü sözü (motto) belirle.` }];
  if (pdfBase64) parts.push({ inlineData: { mimeType: "application/pdf", data: pdfBase64 } });
  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: { parts },
      config: {
        systemInstruction: ACADEMIC_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            motto: { type: Type.STRING, description: "Üniteyi özetleyen veya ünite girişinde yer alan hikmetli söz." },
            keyDates: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { date: { type: Type.STRING }, event: { type: Type.STRING } } } },
            importantFigures: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, role: { type: Type.STRING } } } }
          },
          required: ["title", "content", "motto", "keyDates", "importantFigures"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (err) { return handleAIError(err); }
};

export const generateWeeklyPlan = async (studentName: string, courses: string[], availability: DayAvailability[]): Promise<WeeklyPlan> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");
  const availabilityString = availability.filter(a => a.slots.length > 0).map(a => `${a.day}: ${a.slots.join(', ')} saatlerinde müsaidim.`).join('\n');
  try {
    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: `Öğrenci ${studentName} için haftalık program... ${courses.join(', ')}. ${availabilityString}`,
      config: {
        systemInstruction: ACADEMIC_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sessions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { day: { type: Type.STRING }, time: { type: Type.STRING }, courseName: { type: Type.STRING }, topic: { type: Type.STRING }, duration: { type: Type.STRING }, type: { type: Type.STRING } } } },
            advice: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (err) { return handleAIError(err); }
};

export const compareHistory = async (entity1: string, entity2: string): Promise<ComparisonResult> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");
  try {
    const response = await ai.models.generateContent({
      model: PRO_MODEL,
      contents: `"${entity1}" ve "${entity2}" karşılaştırması.`,
      config: {
        systemInstruction: ACADEMIC_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: { type: Type.OBJECT, properties: { entities: { type: Type.ARRAY, items: { type: Type.STRING } }, aspects: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, entity1Info: { type: Type.STRING }, entity2Info: { type: Type.STRING } } } }, conclusion: { type: Type.STRING } } }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (err) { return handleAIError(err); }
};

export const generateGenealogy = async (courseName: string): Promise<RulerNode[]> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");
  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `"${courseName}" hükümdarlar şeceresi.`,
      config: {
        systemInstruction: ACADEMIC_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, period: { type: Type.STRING }, keyAction: { type: Type.STRING } } } }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (err) { return handleAIError(err); }
};

export const researchLatestInsights = async (topic: string): Promise<{ text: string, links: { title: string, url: string }[] }> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");
  try {
    const response = await ai.models.generateContent({ model: DEFAULT_MODEL, contents: `"${topic}" hakkında güncel bulgular.`, config: { systemInstruction: ACADEMIC_SYSTEM_INSTRUCTION, tools: [{ googleSearch: {} }] } });
    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(chunk => chunk.web)?.map(chunk => ({ title: chunk.web!.title, url: chunk.web!.uri })) || [];
    return { text: response.text || "", links };
  } catch (err) { return handleAIError(err); }
};

export const generateFlashcards = async (courseName: string): Promise<Flashcard[]> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");
  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `"${courseName}" flashcards.`,
      config: { systemInstruction: ACADEMIC_SYSTEM_INSTRUCTION, responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { front: { type: Type.STRING }, back: { type: Type.STRING } } } } }
    });
    return JSON.parse(response.text || '[]');
  } catch (err) { return handleAIError(err); }
};

export const getHistoricalLocations = async (courseName: string, context: string) => {
  const ai = getAI();
  if (!ai) return null;
  try {
    const response = await ai.models.generateContent({ model: MAPS_MODEL, contents: `${courseName} lokasyonlar: ${context}`, config: { systemInstruction: ACADEMIC_SYSTEM_INSTRUCTION, tools: [{ googleMaps: {} }] } });
    return { text: response.text, chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
  } catch (err) { return handleAIError(err); }
};

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");
  try {
    const response = await ai.models.generateContent({ model: TTS_MODEL, contents: [{ parts: [{ text }] }], config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } } });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Ses verisi alınamadı");
    return base64Audio;
  } catch (err) { return handleAIError(err); }
};

export const generateQuiz = async (courseName: string): Promise<QuizQuestion[]> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");
  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `"${courseName}" quiz.`,
      config: { systemInstruction: ACADEMIC_SYSTEM_INSTRUCTION, responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.INTEGER }, explanation: { type: Type.STRING } } } } }
    });
    return JSON.parse(response.text || '[]');
  } catch (err) { return handleAIError(err); }
};

export const chatWithTutor = async (courseName: string, history: any[]): Promise<{ text: string, links: { title: string, url: string }[] }> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");
  try {
    const response = await ai.models.generateContent({ model: DEFAULT_MODEL, contents: history, config: { systemInstruction: `${ACADEMIC_SYSTEM_INSTRUCTION} ${courseName}`, tools: [{ googleSearch: {} }] } });
    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter(chunk => chunk.web)?.map(chunk => ({ title: chunk.web!.title, url: chunk.web!.uri })) || [];
    return { text: response.text || "", links };
  } catch (err) { return handleAIError(err); }
};

export const interviewCharacter = async (characterName: string, characterTitle: string, history: any[]): Promise<string | undefined> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");
  try {
    const response = await ai.models.generateContent({ model: PRO_MODEL, contents: history, config: { systemInstruction: `${ACADEMIC_SYSTEM_INSTRUCTION} Karakter: ${characterName} (${characterTitle})` } });
    return response.text;
  } catch (err) { return handleAIError(err); }
};
