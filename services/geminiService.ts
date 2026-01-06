
import { GoogleGenAI, Type } from "@google/genai";

export async function suggestSpecification(itemName: string) {
  if (!itemName || itemName.length < 2) return null;

  try {
    // Create instance right before use to ensure the latest API key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an ERP assistant for Samuda Construction. Suggest common industrial specifications for the item: "${itemName}". Return only the most common specification string.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    // Access response text as a property
    return response.text?.trim() || null;
  } catch (err) {
    console.error("Gemini suggestion error:", err);
    return null;
  }
}

export async function getIntelligentInsights(mprsData: any[]) {
  try {
    // Create instance right before use to ensure the latest API key is used
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these material requisitions and give 3 short bullet points about trends or reorder advice: ${JSON.stringify(mprsData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    // Safely extract text from the response object
    const text = response.text;
    if (text) {
      return JSON.parse(text.trim());
    }
    return ["Maintain stock levels", "Check lead times", "Review bulk discounts"];
  } catch (err) {
    console.error("Gemini insights error:", err);
    return ["Maintain stock levels", "Check lead times", "Review bulk discounts"];
  }
}
