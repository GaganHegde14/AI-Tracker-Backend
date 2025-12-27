import { GoogleGenAI } from "@google/genai";
import { aiAssistantPrompt } from "../utils/aiAssistantPrompt.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function GiminiAiAssistant(userMessage, userTasks, userData) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: aiAssistantPrompt(userMessage, userTasks, userData),
  });

  const aiText = response.text;
  const cleanText = aiText.replace(/```json|```/gi, "").trim();
  return JSON.parse(cleanText);
}

export default GiminiAiAssistant;

