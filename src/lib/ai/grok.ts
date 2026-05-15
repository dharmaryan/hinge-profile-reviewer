import OpenAI from "openai";
import { ReviewResult } from "./types";
import { buildSystemPrompt } from "./prompt-templates";
import { parseReviewJSON } from "./parse-json";

const MODELS = ["grok-4.3", "grok-2-vision-latest"];

export async function reviewWithGrok(
  images: string[],
  persona: string
): Promise<ReviewResult> {
  const client = new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: "https://api.x.ai/v1",
  });
  const systemPrompt = buildSystemPrompt(persona);

  const imageContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] =
    images.map((img) => ({
      type: "image_url" as const,
      image_url: { url: img, detail: "high" as const },
    }));

  let lastError: Error | null = null;

  for (const modelId of MODELS) {
    try {
      console.log(`[grok] Trying ${modelId}...`);
      const response = await client.chat.completions.create({
        model: modelId,
        max_tokens: 4096,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              ...imageContent,
              {
                type: "text",
                text: "Review this Hinge profile based on the screenshots above.",
              },
            ],
          },
        ],
      });

      const text = response.choices[0]?.message?.content ?? "";
      return parseReviewJSON(text);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`[grok] ${modelId} failed:`, lastError.message);
    }
  }

  throw lastError ?? new Error("All Grok models failed");
}
