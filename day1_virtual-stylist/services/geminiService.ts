import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, OutfitStyle, VisualType } from "../types";

// Ensure API key is present
const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY' }); // Fallback to prevent crash if env missing, but won't work

// Helper to remove header from base64 string
const cleanBase64 = (base64: string) => {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

export const analyzeClothingItem = async (imageBase64: string): Promise<AnalysisResult> => {
  if (!apiKey) throw new Error("API Key is missing");

  const prompt = `
    Analyze this clothing item image.
    1. Identify the item (category, color, pattern, style).
    2. Create 3 distinct unisex/gender-neutral outfit plans featuring this item for these occasions: Casual, Business, Night Out.
    3. For each plan, list key items that go well with it, a color palette, and a brief explanation of why it works.
    4. Avoid gender-specific terminology (e.g. avoid 'blouse', 'skirt' unless referring to the input item, use 'shirt', 'pants', 'jacket' etc.).
    
    Return the response in JSON format matching this schema:
    {
      "itemAnalysis": { "description": "string", "category": "string", "baseColor": "string" },
      "outfitPlans": [
        { 
          "style": "Casual" | "Business" | "Night Out",
          "description": "string",
          "keyItems": ["string"],
          "colorPalette": ["string"],
          "whyItWorks": "string"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64(imageBase64) } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemAnalysis: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                baseColor: { type: Type.STRING },
              },
              required: ['description', 'category', 'baseColor']
            },
            outfitPlans: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  style: { type: Type.STRING, enum: ['Casual', 'Business', 'Night Out'] },
                  description: { type: Type.STRING },
                  keyItems: { type: Type.ARRAY, items: { type: Type.STRING } },
                  colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
                  whyItWorks: { type: Type.STRING },
                },
                required: ['style', 'description', 'keyItems', 'colorPalette', 'whyItWorks']
              }
            }
          },
          required: ['itemAnalysis', 'outfitPlans']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No analysis generated");
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const generateOutfitVisual = async (imageBase64: string, planDescription: string, style: OutfitStyle, type: VisualType): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  let prompt = "";
  
  if (type === 'flat-lay') {
    prompt = `
      Create a high-fashion flat-lay photography of a ${style} outfit.
      The outfit MUST include the clothing item in the reference image.
      The overall style must be unisex and gender-neutral.
      Complete the look based on this description: ${planDescription}.
      The layout should be clean, organized on a neutral background, looking like a professional stylist's recommendation.
      Ensure the lighting is soft and the composition is balanced.
    `;
  } else {
    prompt = `
      Create a full-body fashion photography of a gender-neutral model wearing this ${style} outfit.
      The model is wearing the clothing item in the reference image.
      The outfit is completed based on this description: ${planDescription}.
      The setting should be a clean, minimal studio background.
      The pose should be natural and stylish.
      Ensure high photorealism and professional lighting.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64(imageBase64) } },
          { text: prompt }
        ]
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};

export const editImageWithPrompt = async (imageBase64: string, prompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64(imageBase64) } },
          { text: prompt }
        ]
      }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No edited image returned");
  } catch (error) {
    console.error("Edit failed:", error);
    throw error;
  }
};