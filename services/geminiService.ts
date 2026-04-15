import { GoogleGenAI, Type } from "@google/genai";
import { Coordinate } from "../types";

const cleanBase64 = (dataUrl: string): string => {
  return dataUrl.split(',')[1] || dataUrl;
};

const getMimeType = (dataUrl: string): string => {
  const match = dataUrl.match(/^data:(.*);base64,/);
  return match ? match[1] : 'image/jpeg';
};

export const validateHumanPresence = async (imageBase64: string): Promise<{ valid: boolean; isFullBody?: boolean; reason?: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: getMimeType(imageBase64),
              data: cleanBase64(imageBase64),
            },
          },
          {
            text: "Analyze this image. 1. Does it contain one or more humans (groups are allowed)? 2. Are the people fully visible from head to toe? Return a JSON object.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hasHumans: { type: Type.BOOLEAN },
            isFullBody: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
          },
          required: ["hasHumans", "isFullBody"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      valid: result.hasHumans === true,
      isFullBody: result.isFullBody === true,
      reason: result.reason,
    };
  } catch (error) {
    return { valid: true, isFullBody: true };
  }
};

export const generateCompositeScene = async (
  personImage: string,
  backgroundImage: string,
  coord?: Coordinate,
  customPrompt?: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const spatialDirective = coord 
      ? `2. SPATIAL ANCHORING: Place the subjects' feet exactly at X=${coord.pixelX}, Y=${coord.pixelY}.`
      : `2. SPATIAL ANCHORING: Place the subjects naturally within the scene, ensuring they are grounded on the floor or a logical surface. Adjust their scale to match the perspective of the environment.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: getMimeType(personImage),
              data: cleanBase64(personImage),
            },
          },
          {
            inlineData: {
              mimeType: getMimeType(backgroundImage),
              data: cleanBase64(backgroundImage),
            },
          },
          {
            text: `MISSION: You are a master photo editor. Integrate the subjects from Image 1 into the historical environment of Image 2. Your goal is a "Single-Layer" look: the subjects must look like they were captured on the same physical piece of film as the background.
            1. Keyout the human figure from uploaded image (Image 1).
            2. Place the human figure onto the background image (Image 2), alter the posture, color, position, and size of the human figure according to the perspective, color temperature, and noise of the background image; keeping the face, hairstyle, and clothing the same as uploaded image.
            3. CRITICAL: Do not alter anything of the background image (Image 2). The background must remain 100% identical to the original. Do not add, remove, or modify any pixels of the background.
            4. If the human figure uploaded is half-body, make it stick to the bottom of the picture, making it look like they are taking a half-body picture.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3",
          imageSize: "1K"
        }
      }
    });

    const candidate = response.candidates?.[0];
    if (!candidate) {
      throw new Error("The AI model returned no candidates. This might be due to safety filters.");
    }

    const imagePart = candidate.content?.parts.find(p => p.inlineData);

    if (imagePart?.inlineData?.data) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }
    
    // If no image, check if there's text explaining why
    const textPart = candidate.content?.parts.find(p => p.text);
    if (textPart?.text) {
      throw new Error(`The AI model did not return an image. Message: ${textPart.text}`);
    }

    throw new Error("The AI model returned no image data.");
  } catch (error: any) {
    console.error("Generation error:", error);
    throw new Error(error.message || "An unexpected error occurred.");
  }
};