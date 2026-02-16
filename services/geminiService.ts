
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { CourseId, StudySummary, QuizQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSummary = async (courseName: string): Promise<StudySummary> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `AUZEF Tarih 3. Sınıf düzeyinde, "${courseName}" dersi için kapsamlı bir çalışma özeti hazırla. Özet, ana metin, önemli tarihler ve önemli şahsiyetleri içermelidir.`,
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

  return JSON.parse(response.text);
};

export const generateQuiz = async (courseName: string): Promise<QuizQuestion[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `AUZEF Tarih 3. Sınıf müfredatına uygun olarak "${courseName}" dersi hakkında 5 adet çoktan seçmeli test sorusu hazırla. Sorular akademik düzeyde ve öğretici olmalıdır.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER, description: "Doğru seçeneğin index numarası (0-3)" },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const chatWithTutor = async (courseName: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `Sen AUZEF Tarih bölümü için uzman bir asistansın. Kullanıcı şu an "${courseName}" dersine çalışıyor. Sorularına akademik bir dille, kanıtlara dayalı ve öğretici cevaplar ver. Gerektiğinde kaynakça ve önemli tarihleri vurgula.`
    }
  });

  const lastMessage = history[history.length - 1].parts[0].text;
  const result = await chat.sendMessage({ message: lastMessage });
  return result.text;
};
