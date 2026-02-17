
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StudySummary, QuizQuestion, Flashcard, RulerNode, ComparisonResult, WeeklyPlan, DayAvailability } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("HATA: API_KEY bulunamadı!");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Genel görevler için Gemini 3 Flash
const DEFAULT_MODEL = "gemini-3-flash-preview";
// Harita araçları için Gemini 2.5 Flash
const MAPS_MODEL = "gemini-2.5-flash";
// Ses üretimi için TTS modeli
const TTS_MODEL = "gemini-2.5-flash-preview-tts";

const handleAIError = (error: any) => {
  console.error("AI API Hatası:", error);
  throw error;
};

export const generateWeeklyPlan = async (studentName: string, courses: string[], availability: DayAvailability[]): Promise<WeeklyPlan> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");
  
  const availabilityString = availability
    .filter(a => a.slots.length > 0)
    .map(a => `${a.day}: ${a.slots.join(', ')} saatlerinde müsaidim.`)
    .join('\n');

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `Öğrenci ${studentName} için şu dersleri içeren bir haftalık AUZEF Tarih çalışma programı hazırlamanı istiyorum: ${courses.join(', ')}. 
      
      KRİTİK KISITLAMA: Öğrenci sadece şu gün ve saatlerde ders çalışabilir:
      ${availabilityString}

      JSON formatında 'sessions' (day, time, courseName, topic, duration, type) ve genel bir 'advice' metni döndür.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sessions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  time: { type: Type.STRING },
                  courseName: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  type: { type: Type.STRING }
                },
                required: ["day", "time", "courseName", "topic", "duration", "type"]
              }
            },
            advice: { type: Type.STRING }
          },
          required: ["sessions", "advice"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (err) {
    return handleAIError(err);
  }
};

export const compareHistory = async (entity1: string, entity2: string): Promise<ComparisonResult> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");
  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `"${entity1}" ve "${entity2}" yapılarını; askeri sistem, siyasi yapı, ekonomik temel ve kültürel miras açılarından karşılaştır.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            entities: { type: Type.ARRAY, items: { type: Type.STRING } },
            aspects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  entity1Info: { type: Type.STRING },
                  entity2Info: { type: Type.STRING }
                },
                required: ["title", "entity1Info", "entity2Info"]
              }
            },
            conclusion: { type: Type.STRING }
          },
          required: ["entities", "aspects", "conclusion"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (err) {
    return handleAIError(err);
  }
};

export const generateGenealogy = async (courseName: string): Promise<RulerNode[]> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");
  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `"${courseName}" dersi ile ilgili en önemli hükümdarların kronolojik soy ağacı yapısını hazırla.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              period: { type: Type.STRING },
              keyAction: { type: Type.STRING }
            },
            required: ["name", "period", "keyAction"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (err) {
    return handleAIError(err);
  }
};

export const generateSummary = async (courseName: string): Promise<StudySummary> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");
  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `AUZEF Tarih 3. Sınıf müfredatına uygun olarak "${courseName}" dersi için detaylı bir akademik özet hazırla.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            keyDates: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { date: { type: Type.STRING }, event: { type: Type.STRING } } } },
            importantFigures: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, role: { type: Type.STRING } } } }
          },
          required: ["title", "content", "keyDates", "importantFigures"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (err) {
    return handleAIError(err);
  }
};

export const generateFlashcards = async (courseName: string): Promise<Flashcard[]> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");
  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `"${courseName}" dersi için en önemli 10 kavram, olay veya tarih içeren ezber kartı (flashcard) hazırla.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { front: { type: Type.STRING }, back: { type: Type.STRING } },
            required: ["front", "back"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (err) {
    return handleAIError(err);
  }
};

export const getHistoricalLocations = async (courseName: string, context: string) => {
  const ai = getAI();
  if (!ai) return null;
  try {
    const response = await ai.models.generateContent({
      model: MAPS_MODEL,
      contents: `${courseName} dersindeki şu olayların geçtiği coğrafi konumları bul ve açıkla: ${context}`,
      config: { tools: [{ googleMaps: {} }] }
    });
    return { text: response.text, chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] };
  } catch (err) {
    return handleAIError(err);
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");
  try {
    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }
          }
        }
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Ses verisi alınamadı");
    return base64Audio;
  } catch (err) {
    return handleAIError(err);
  }
};

export const generateQuiz = async (courseName: string): Promise<QuizQuestion[]> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");
  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `AUZEF "${courseName}" dersi için 5 adet zorlayıcı çoktan seçmeli soru hazırla.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.INTEGER }, explanation: { type: Type.STRING } },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (err) {
    return handleAIError(err);
  }
};

export const chatWithTutor = async (courseName: string, history: any[]): Promise<string | undefined> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");
  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: history,
      config: { systemInstruction: `Sen bir AUZEF Tarih Bölümü 3. sınıf asistanısın. Ders: ${courseName}.` }
    });
    return response.text;
  } catch (err) {
    return handleAIError(err);
  }
};

export const interviewCharacter = async (characterName: string, characterTitle: string, history: any[]): Promise<string | undefined> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");
  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: history,
      config: {
        systemInstruction: `Sen ${characterName} isminde bir tarihi karaktersin.`
      }
    });
    return response.text;
  } catch (err) {
    return handleAIError(err);
  }
};
