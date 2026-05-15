import OpenAI from "openai";
import { ReviewResult } from "./types";
import { buildSystemPrompt } from "./prompt-templates";

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

  const response = await client.chat.completions.create({
    model: "grok-4.3",
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
  const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  return JSON.parse(cleaned) as ReviewResult;
}
