import Anthropic from "@anthropic-ai/sdk";
import { ReviewResult } from "./types";
import { buildSystemPrompt } from "./prompt-templates";
import { parseReviewJSON } from "./parse-json";

export async function reviewWithClaude(
  images: string[],
  persona: string
): Promise<ReviewResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const systemPrompt = buildSystemPrompt(persona);

  const imageContent: Anthropic.Messages.ImageBlockParam[] = images.map(
    (img) => {
      const base64Data = img.replace(/^data:image\/\w+;base64,/, "");
      return {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: "image/jpeg" as const,
          data: base64Data,
        },
      };
    }
  );

  const response = await client.messages.create(
    {
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
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
    },
  );

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  return parseReviewJSON(text);
}
