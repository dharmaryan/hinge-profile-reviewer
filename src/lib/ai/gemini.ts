import { GoogleGenerativeAI } from "@google/generative-ai";
import { ReviewResult } from "./types";
import { buildSystemPrompt } from "./prompt-templates";
import { parseReviewJSON } from "./parse-json";

export async function reviewWithGemini(
  images: string[],
  persona: string
): Promise<ReviewResult> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  const systemPrompt = buildSystemPrompt(persona);

  const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    systemInstruction: systemPrompt,
    generationConfig: {
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  });

  const imageParts = images.map((img) => {
    const base64Data = img.replace(/^data:image\/\w+;base64,/, "");
    return {
      inlineData: {
        mimeType: "image/jpeg" as const,
        data: base64Data,
      },
    };
  });

  const result = await model.generateContent([
    ...imageParts,
    { text: "Review this Hinge profile based on the screenshots above." },
  ]);

  const text = result.response.text();
  return parseReviewJSON(text);
}
