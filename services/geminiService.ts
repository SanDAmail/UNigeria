
import { GoogleGenAI } from "@google/genai";
import { Message, Persona, GroundingChunk, Profile } from '../types';

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

export const generateChatSummary = async (history: Message[]): Promise<string> => {
    if (!ai) throw new Error("AI service not initialized. API Key may be missing.");
    if (history.length === 0) return "There is no conversation to summarize.";

    const conversationText = history
        .map(msg => `${msg.authorInfo?.name || msg.sender}: ${msg.text}`)
        .join('\n');
    
    const prompt = `Please provide a concise, neutral summary of the key points, issues, and outcomes from the following town hall discussion. Focus on the main topics and ignore pleasantries.

Discussion:
---
${conversationText}
---
Summary:`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { temperature: 0.3 }
        });

        return response.text;
    } catch (error) {
        console.error("Error generating chat summary:", error);
        throw new Error("Could not generate summary at this time.");
    }
};

export const generateLgaAnalysis = async (reportTitles: string[]): Promise<{ overview: string, keyConcerns: string[] }> => {
    if (!ai) throw new Error("AI service not initialized. API Key may be missing.");
    if (reportTitles.length === 0) {
        return { overview: "No reports were submitted for this location, so no analysis can be generated.", keyConcerns: [] };
    }

    const prompt = `Analyze the following list of report titles from a specific Local Government Area (LGA) in Nigeria. Based on these titles, provide a high-level analysis.

Report Titles:
${reportTitles.map(t => `- ${t}`).join('\n')}

Your task is to respond with a valid JSON object containing two keys:
1. "overview": A single-paragraph summary (3-4 sentences) describing the general state of the LGA based on the reports.
2. "keyConcerns": An array of 3-5 short strings, each representing a distinct, high-level category of concern identified from the titles (e.g., "Road Infrastructure", "Security Issues", "Waste Management", "Power Supply").

Respond ONLY with the JSON object.`;

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
        const result = extractJson(rawResponseText);
        // Basic validation
        if (result && typeof result.overview === 'string' && Array.isArray(result.keyConcerns)) {
            return result;
        }
        throw new Error("AI returned malformed JSON for LGA analysis.");

    } catch (error) {
        console.error("Error generating/parsing LGA analysis:", error);
        console.error("Raw AI Response for LGA analysis that failed parsing:", rawResponseText);
        throw new Error("Failed to generate insights for this LGA.");
    }
};

export const generateStateComparison = async (state1: Profile, state2: Profile): Promise<string> => {
    if (!ai) throw new Error("AI service not initialized.");

    const prompt = `
You are a geopolitical and economic analyst specializing in Nigeria. Provide a concise, professional, and neutral comparison of the two Nigerian states provided below.

Your analysis should be in a single paragraph and highlight their key differences and similarities across these four areas:
1.  **Economy:** Compare their primary economic drivers (e.g., industrial, agrarian, oil-based, service-oriented), GDP, and key resources.
2.  **Geography & Demographics:** Contrast their land area, population density, and major ethnic compositions.
3.  **Governance & History:** Briefly touch on their historical significance or governance style.
4.  **Culture & Tourism:** Mention their slogans and one key cultural or tourist landmark for each.

Conclude with a summary sentence on their overall character. Avoid using markdown lists; write a fluid, well-structured paragraph.

**State 1: ${state1.name}**
- Slogan: ${state1.slogan}
- Region: ${state1.region}
- GDP: ${state1.gdp}
- Population: ${state1.population}
- Land Area: ${state1.landArea}
- Key Industries: ${state1.majorIndustries?.join(', ')}
- Notable Site: ${state1.notableSites?.[0]}

**State 2: ${state2.name}**
- Slogan: ${state2.slogan}
- Region: ${state2.region}
- GDP: ${state2.gdp}
- Population: ${state2.population}
- Land Area: ${state2.landArea}
- Key Industries: ${state2.majorIndustries?.join(', ')}
- Notable Site: ${state2.notableSites?.[0]}

Begin the analysis directly. For example: "Comparing ${state1.name} and ${state2.name} reveals a contrast between..."
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { temperature: 0.5 }
        });
        
        return response.text;
    } catch (error) {
        console.error("Error generating state comparison:", error);
        throw new Error("Could not generate AI comparison at this time.");
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
