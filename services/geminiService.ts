
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StudySummary, QuizQuestion } from "../types";

// Internal helper to initialize the AI client with the required environment key.
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY eksik! Lütfen yapılandırmayı kontrol edin.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Generates an academic summary for a specific history course.
export const generateSummary = async (courseName: string): Promise<StudySummary> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `AUZEF Tarih 3. Sınıf müfredatına uygun olarak "${courseName}" dersi için detaylı bir akademik özet hazırla.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          keyDates: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                event: { type: Type.STRING }
              }
            }
          },
          importantFigures: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                role: { type: Type.STRING }
              }
            }
          }
        },
        required: ["title", "content", "keyDates", "importantFigures"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

// Uses Google Maps grounding to identify relevant historical locations mentioned in the course.
export const getHistoricalLocations = async (courseName: string, context: string) => {
  const ai = getAI();
  if (!ai) return null;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${courseName} dersindeki şu bağlamla ilgili önemli tarihi coğrafi konumları bul: ${context}`,
    config: {
      tools: [{ googleMaps: {} }]
    }
  });

  return {
    text: response.text,
    chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

// Converts text to academic speech audio using Gemini's TTS capabilities.
export const generateSpeech = async (text: string): Promise<ArrayBuffer> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Lütfen şu tarih dersi notunu akademik ve tane tane bir sesle oku: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Ses verisi alınamadı");

  // Decode the raw PCM bytes from base64 string
  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Generates a multiple-choice quiz for the selected course.
export const generateQuiz = async (courseName: string): Promise<QuizQuestion[]> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `AUZEF "${courseName}" dersi için 5 adet zorlayıcı çoktan seçmeli soru hazırla.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

// Provides an interactive chat experience with a history-aware history tutor.
export const chatWithTutor = async (courseName: string, history: any[]): Promise<string | undefined> => {
  const ai = getAI();
  if (!ai) throw new Error("AI başlatılamadı");

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: history,
    config: {
      systemInstruction: `Sen bir AUZEF Tarih Bölümü 3. sınıf asistanısın. Ders: ${courseName}. Öğrencilerin sorularını akademik bir dille, tarihsel gerçekliklere sadık kalarak ve yardımsever bir şekilde cevapla.`,
    }
  });

  return response.text;
};
