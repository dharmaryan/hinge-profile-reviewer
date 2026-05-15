import { GoogleGenerativeAI } from "@google/generative-ai";
import { ReviewResult } from "./types";
import { buildSystemPrompt } from "./prompt-templates";
import { parseReviewJSON } from "./parse-json";

const MODELS = ["gemini-3.1-flash-lite", "gemini-2.5-flash"];

export async function reviewWithGemini(
  images: string[],
  persona: string
): Promise<ReviewResult> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  const systemPrompt = buildSystemPrompt(persona);

  const imageParts = images.map((img) => {
    const base64Data = img.replace(/^data:image\/\w+;base64,/, "");
    return {
      inlineData: {
        mimeType: "image/jpeg" as const,
        data: base64Data,
      },
    };
  });

  let lastError: Error | null = null;

  for (const modelId of MODELS) {
    try {
      console.log(`[gemini] Trying ${modelId}...`);
      const model = genAI.getGenerativeModel({
        model: modelId,
        systemInstruction: systemPrompt,
        generationConfig: {
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent([
        ...imageParts,
        { text: "Review this Hinge profile based on the screenshots above." },
      ]);

      const text = result.response.text();
      return parseReviewJSON(text);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`[gemini] ${modelId} failed:`, lastError.message);
    }
  }

  throw lastError ?? new Error("All Gemini models failed");
}
