import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { personaInputSchema } from "@/lib/validation";
import { buildPersonaGenerationPrompt } from "@/lib/ai/prompt-templates";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = personaInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const prompt = buildPersonaGenerationPrompt(parsed.data);

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ persona: text });
  } catch (err) {
    console.error("Persona generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate persona" },
      { status: 500 }
    );
  }
}
