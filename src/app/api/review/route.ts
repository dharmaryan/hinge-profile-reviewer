import { NextRequest } from "next/server";
import { reviewRequestSchema } from "@/lib/validation";
import { reviewWithClaude } from "@/lib/ai/claude";
import { reviewWithChatGPT } from "@/lib/ai/openai";
import { reviewWithGemini } from "@/lib/ai/gemini";
import { reviewWithGrok } from "@/lib/ai/grok";
import { ModelName } from "@/lib/ai/types";

export const maxDuration = 120;

const adapters: Record<ModelName, (images: string[], persona: string) => Promise<unknown>> = {
  claude: reviewWithClaude,
  chatgpt: reviewWithChatGPT,
  gemini: reviewWithGemini,
  grok: reviewWithGrok,
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = reviewRequestSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid input" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { images, persona } = parsed.data;

  console.log(`[review] Starting stream with ${images.length} images`);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const send = (model: ModelName, data: unknown) => {
        controller.enqueue(encoder.encode(JSON.stringify({ model, ...data as Record<string, unknown> }) + "\n"));
      };

      const promises = (Object.entries(adapters) as [ModelName, typeof adapters[ModelName]][]).map(
        async ([name, fn]) => {
          try {
            console.log(`[${name}] Starting...`);
            const result = await fn(images, persona);
            console.log(`[${name}] Success`);
            send(name, { status: "fulfilled", data: result });
          } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            console.error(`[${name}] Failed:`, message);
            send(name, { status: "rejected", error: message });
          }
        }
      );

      await Promise.all(promises);
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
