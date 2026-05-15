import OpenAI from "openai";
import { ReviewResult } from "./types";
import { buildSystemPrompt } from "./prompt-templates";
import { parseReviewJSON } from "./parse-json";

const MODELS = ["gpt-5.4-mini", "gpt-4.1-mini", "gpt-4o-mini"];

export async function reviewWithChatGPT(
  images: string[],
  persona: string
): Promise<ReviewResult> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const systemPrompt = buildSystemPrompt(persona);

  const imageContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] =
    images.map((img) => ({
      type: "image_url" as const,
      image_url: { url: img, detail: "high" as const },
    }));

  let lastError: Error | null = null;

  for (const modelId of MODELS) {
    try {
      console.log(`[chatgpt] Trying ${modelId}...`);
      // Newer models use max_completion_tokens, older use max_tokens
      const useNewParam = modelId.startsWith("gpt-5");

      const response = await client.chat.completions.create({
        model: modelId,
        ...(useNewParam
          ? { max_completion_tokens: 4096 }
          : { max_tokens: 4096 }),
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
      console.error(`[chatgpt] ${modelId} failed:`, lastError.message);
    }
  }

  throw lastError ?? new Error("All OpenAI models failed");
}
