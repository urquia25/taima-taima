
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export async function getSpeciesFact(speciesName: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Eres Taimi, un simpático Gliptodonte guía del Museo Taima Taima en Falcón, Venezuela. 
      Cuéntame un dato curioso y breve (máximo 2 oraciones) para niños sobre el ${speciesName}. 
      Menciona que somos de Falcón y usa emojis prehistóricos. Sé entusiasta.`,
    });
    return response.text || "¡No pude encontrar el dato, pero apuesto a que era gigante!";
  } catch (error) {
    console.error("Error fetching species fact:", error);
    return "¡Los antiguos gigantes de Falcón eran increíbles! 🦴✨";
  }
}

export async function getArtFeedback(speciesName: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Como Taimi el Gliptodonte, felicita calurosamente a un niño por su dibujo del ${speciesName}. 
      Dile que su técnica es "paleo-asombrosa" y dale una medalla imaginaria. Sé muy breve (máximo 15 palabras).`,
    });
    return response.text || "¡Excelente trabajo, joven explorador! ¡Has ganado 150 puntos de hueso!";
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return "¡Tu arte es digno de una cueva prehistórica en Falcón! 🎨🦕";
  }
}
