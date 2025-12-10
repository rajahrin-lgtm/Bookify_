import { GoogleGenAI, Type } from "@google/genai";
import { Book } from "../types";

// Initialize Gemini Client
// The API key is injected via vite.config.ts into process.env.API_KEY
// DO NOT use import.meta.env here to strictly follow SDK guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchBooks = async (query: string): Promise<Book[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Recommend 6 books relevant to this search query: "${query}". Return a clean JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              author: { type: Type.STRING },
              year: { type: Type.STRING },
              genre: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["title", "author", "year", "genre", "description"],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as Book[];
    }
    return [];
  } catch (error) {
    console.error("Gemini Search Error:", error);
    // Don't crash the app, just return empty
    return [];
  }
};

export const autoFillBookMetadata = async (isbnOrTitle: string): Promise<Partial<Book>> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide metadata for the book with ISBN or Title: "${isbnOrTitle}". 
                 If the input is ambiguous, provide the most likely popular book.
                 Return a JSON object.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            year: { type: Type.STRING },
            genre: { type: Type.STRING },
            description: { type: Type.STRING },
            isbn: { type: Type.STRING },
          },
          required: ["title", "author", "genre"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return {};
  } catch (error) {
    console.error("Gemini Metadata Error:", error);
    throw new Error("Could not auto-fill metadata.");
  }
};