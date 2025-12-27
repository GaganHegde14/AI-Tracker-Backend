import { GoogleGenAI } from "@google/genai";
import { aiPrompt } from "../utils/aiPrompt.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function GiminiAi(userTask, currentDate) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: aiPrompt(userTask, currentDate),
  });

  const aiText = response.text;
  const cleanText = aiText.trim();
  return JSON.parse(cleanText);
}

export default GiminiAi;
