import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function analyzeImage(base64Data, mimeType = "image/jpeg") {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `Analyze this image for a stock photography marketplace.
  Return a JSON object with:
  1. "title": A catchy, concise title (Portuguese).
  2. "description": A detailed description of the scene, mood, lighting, and subjects (Portuguese). This will be used for search indexing so be descriptive.
  3. "tags": An array of 10-15 relevant keywords/tags (Portuguese), including objects, colors, feelings, and style.
  4. "primaryColor": The dominant color name (Portuguese).
  
  Make sure the output is pure JSON, no markdown formatting.`;

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType,
    },
  };

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown code blocks if Gemini adds them
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(error.message || "Failed to analyze image with AI");
  }
}
