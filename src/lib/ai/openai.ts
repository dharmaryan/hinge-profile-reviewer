import OpenAI from "openai";
import { ReviewResult } from "./types";
import { buildSystemPrompt } from "./prompt-templates";

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

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
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
  return JSON.parse(text) as ReviewResult;
}
