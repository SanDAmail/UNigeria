import { GoogleGenAI } from "@google/genai";
import { Message, Persona, ModeratedResponseItem } from '../types';
import { buildHistory, extractJson } from "./geminiService";

let ai: GoogleGenAI | null = null;
try {
  if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  } else {
    console.error("API_KEY environment variable not set for forumService.");
  }
} catch (e) {
  console.error("Failed to initialize GoogleGenAI in forumService", e);
}

class ForumService {
  public async generateInitialDiscussion(
    persona: Persona,
    history: Message[],
    prompt: string
  ): Promise<ModeratedResponseItem[]> {
    if (!ai) throw new Error("AI service not initialized.");
    let rawResponseText = '';
    try {
      const contents = [...buildHistory(history), { role: 'user', parts: [{ text: prompt }] }];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: contents as any,
        config: {
          systemInstruction: persona.systemInstruction, // This is the prompt that asks for a JSON array
          responseMimeType: 'application/json',
          temperature: 0.8,
        }
      });

      rawResponseText = response.text;
      const parsedData = extractJson(rawResponseText);
      
      if (Array.isArray(parsedData)) {
          return parsedData;
      }

      console.error("Parsed data is not an array:", parsedData);
      throw new Error("Received an invalid format from the AI.");

    } catch (error) {
      console.error("Error generating/parsing initial discussion JSON:", error);
      console.error("Raw AI Response that failed parsing:", rawResponseText);
      throw new Error("Failed to generate a moderated response. Please try again.");
    }
  }

  public async generateReply(
    persona: Persona,
    history: Message[],
    prompt: string
  ): Promise<ModeratedResponseItem> {
     if (!ai) throw new Error("AI service not initialized.");
    let rawResponseText = '';

    const replySystemInstruction = `You are an AI moderator managing a forum discussion. The history contains a discussion with multiple viewpoints. The user has just replied. Your task is to generate a SINGLE, relevant response from one of the existing or a new appropriate stakeholder.
    - Analyze the last user message and the preceding conversation.
    - Choose a logical speaker to reply. This can be one of the previous speakers or a new, relevant voice.
    - The reply should be concise (1-3 sentences) and directly address the user's last message.
    - Respond ONLY with a valid JSON object with two keys: "speaker" (the name of the persona replying) and "text" (their response).
    Example response format: {"speaker": "Financial Analyst", "text": "That's a valid point. The long-term economic benefits are projected to outweigh the initial costs."}`;

    try {
      const contents = [...buildHistory(history), { role: 'user', parts: [{ text: prompt }] }];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: contents as any,
        config: {
          systemInstruction: replySystemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        }
      });

      rawResponseText = response.text;
      const parsedData = extractJson(rawResponseText);
      
      if (typeof parsedData === 'object' && parsedData !== null && 'speaker' in parsedData && 'text' in parsedData) {
          return parsedData;
      }

      console.error("Parsed data is not a valid ModeratedResponseItem:", parsedData);
      throw new Error("Received an invalid format from the AI for the reply.");

    } catch (error) {
      console.error("Error generating/parsing forum reply JSON:", error);
      console.error("Raw AI Response that failed parsing:", rawResponseText);
      throw new Error("Failed to generate a forum reply. Please try again.");
    }
  }
}

export const forumService = new ForumService();