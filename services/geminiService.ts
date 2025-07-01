

import { GoogleGenAI } from "@google/genai";
import { Message, Persona, GroundingChunk } from '../types';

let ai: GoogleGenAI | null = null;
try {
  if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  } else {
    console.error("API_KEY environment variable not set.");
  }
} catch (e) {
  console.error("Failed to initialize GoogleGenAI", e);
}


export const buildHistory = (messages: Message[]): {role: string, parts: {text: string}[]}[] => {
  return messages
    .filter(msg => msg.sender === 'user' || (msg.sender === 'ai' && !msg.isStreaming && !msg.isThinking && !msg.error))
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
};

export const generateGroundedText = async (prompt: string): Promise<{ text: string; groundingChunks: GroundingChunk[] | undefined }> => {
  if (!ai) throw new Error("AI service not initialized. API Key may be missing.");
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    return { text, groundingChunks };

  } catch (error) {
    console.error("Error generating grounded text:", error);
    throw new Error("Could not fetch the latest information. Please check your connection.");
  }
};


export const generateStreamingResponse = async (
  persona: Persona,
  history: Message[],
  prompt: string,
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string, groundingChunks: GroundingChunk[] | undefined, suggestions: string[]) => void,
  image?: { mimeType: string, data: string }
): Promise<void> => {
  if (!ai) throw new Error("AI service not initialized. API Key may be missing.");
  try {
    const promptParts: ({text: string} | {inlineData: {mimeType: string, data: string}})[] = [{ text: prompt }];
    if (image) {
      promptParts.push({ 
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        }
      });
    }

    const contents = [...buildHistory(history), { role: 'user', parts: promptParts }];

    const config: any = {
        systemInstruction: persona.systemInstruction,
        temperature: 0.7,
    };

    if (persona.useSearchGrounding) {
        config.tools = [{googleSearch: {}}];
    }

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: contents as any, // Cast because SDK type is strict
      config: config
    });
    
    let fullResponse = '';
    let groundingChunks: GroundingChunk[] | undefined = undefined;
    let suggestionsStarted = false;

    for await (const chunk of responseStream) {
      const chunkText = chunk.text;
      if (chunkText) {
          fullResponse += chunkText;
          
          let textToSendToChunk = chunkText;
          
          if (suggestionsStarted) {
              textToSendToChunk = ''; // We are past the suggestions block start, send nothing more.
          } else if (fullResponse.includes('[SUGGESTIONS_START]')) {
              suggestionsStarted = true;
              
              const markerIndex = textToSendToChunk.indexOf('[SUGGESTIONS_START]');
              if (markerIndex !== -1) {
                  textToSendToChunk = textToSendToChunk.substring(0, markerIndex);
              }
          }
          
          if (textToSendToChunk) {
              onChunk(textToSendToChunk);
          }
      }
      const newChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (newChunks) {
        groundingChunks = newChunks;
      }
    }
    
    let finalResponseText = fullResponse;
    let suggestions: string[] = [];

    // More robustly find and parse the suggestions block
    const suggestionBlockRegex = /\s*\[SUGGESTIONS_START\]([\s\S]*?)(?:\[SUGGESTIONS_END\]|$)/;
    const suggestionMatch = fullResponse.match(suggestionBlockRegex);

    if (suggestionMatch) {
        // The final response text is everything *before* the match.
        finalResponseText = fullResponse.substring(0, suggestionMatch.index).trim();
        
        // The suggestions are the captured group.
        const suggestionContent = suggestionMatch[1] || '';
        if (suggestionContent) {
            suggestions = suggestionContent
                .trim()
                .split('\n')
                .map(s => s.trim().replace(/^- /, '')) // remove markdown list markers
                .filter(Boolean); // remove any empty lines
        }
    }
    
    onComplete(finalResponseText, groundingChunks, suggestions);

  } catch (error) {
    console.error("Error generating streaming response:", error);
    throw error;
  }
};

export const extractJson = (rawText: string): any => {
    let jsonStr = rawText.trim();
    
    // First, try to extract from a markdown code fence
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
        jsonStr = match[1].trim();
    }

    // Fallback to finding the first and last brackets/braces
    // This helps with responses that have leading/trailing text but no fence
    const firstBracket = jsonStr.indexOf('[');
    const firstBrace = jsonStr.indexOf('{');
    
    let startIndex = -1;

    if (firstBracket === -1 && firstBrace === -1) {
        throw new Error("No JSON object or array found in the response.");
    }

    if (firstBracket !== -1 && firstBrace !== -1) {
        startIndex = Math.min(firstBracket, firstBrace);
    } else if (firstBracket !== -1) {
        startIndex = firstBracket;
    } else {
        startIndex = firstBrace;
    }

    const lastBracket = jsonStr.lastIndexOf(']');
    const lastBrace = jsonStr.lastIndexOf('}');

    const endIndex = Math.max(lastBracket, lastBrace);

    if (endIndex === -1 || endIndex < startIndex) {
        throw new Error("Malformed JSON response; could not find valid closing bracket/brace.");
    }
    
    const potentialJson = jsonStr.substring(startIndex, endIndex + 1);

    return JSON.parse(potentialJson);
}

export const generateImageResponse = async (prompt: string): Promise<string | null> => {
  if (!ai) throw new Error("AI service not initialized. API Key may be missing.");
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: `A high-quality, vibrant, artistic image representing the following concept, with Nigerian cultural influences: ${prompt}`,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages[0].image.imageBytes;
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Could not create the image at this time.");
  }
};

export const generateArbitraryJson = async (prompt: string): Promise<any> => {
    if (!ai) throw new Error("AI service not initialized. API Key may be missing.");
    let rawResponseText = '';
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                temperature: 0.2,
            }
        });

        rawResponseText = response.text;
        return extractJson(rawResponseText);

    } catch (error) {
        console.error("Error generating/parsing JSON response:", error);
        console.error("Raw AI Response that failed parsing:", rawResponseText);
        throw new Error("Failed to generate a valid JSON response from the AI.");
    }
};