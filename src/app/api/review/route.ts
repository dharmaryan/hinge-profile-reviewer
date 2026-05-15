import { NextRequest, NextResponse } from "next/server";
import { reviewRequestSchema } from "@/lib/validation";
import { runAllReviews } from "@/lib/ai/run-reviews";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = reviewRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { images, persona } = parsed.data;

    console.log(
      `[review] Starting review with ${images.length} images, persona length: ${persona.length}`
    );
    console.log(`[review] API keys present: anthropic=${!!process.env.ANTHROPIC_API_KEY}, openai=${!!process.env.OPENAI_API_KEY}, google=${!!process.env.GOOGLE_AI_API_KEY}, xai=${!!process.env.XAI_API_KEY}`);

    const results = await runAllReviews(images, persona);

    console.log(
      `[review] Done. Claude: ${results.results.claude.status}, ChatGPT: ${results.results.chatgpt.status}, Gemini: ${results.results.gemini.status}, Grok: ${results.results.grok.status}`
    );

    return NextResponse.json(results);
  } catch (err) {
    console.error("[review] Unhandled error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to run reviews" },
      { status: 500 }
    );
  }
}
