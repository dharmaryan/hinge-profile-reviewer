import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ReviewResponse, ModelName, MODEL_DISPLAY_NAMES } from "@/lib/ai/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { results } = (await req.json()) as { results: ReviewResponse };

    // Build a summary of all successful reviews
    const reviewSummaries: string[] = [];
    const models: ModelName[] = ["claude", "chatgpt", "gemini", "grok"];

    for (const model of models) {
      const r = results.results[model];
      if (r.status === "fulfilled" && r.data) {
        reviewSummaries.push(
          `## ${MODEL_DISPLAY_NAMES[model]}'s Review (${r.data.overall_rating}/10)\n` +
          `Gut reaction: ${r.data.gut_reaction}\n` +
          `Icks: ${r.data.icks.map((i) => `${i.ick} (${i.severity})`).join(", ") || "None"}\n` +
          `Swipe: ${r.data.swipe_right.answer} - ${r.data.swipe_right.reason}\n` +
          `Top changes: ${r.data.top_3_changes.join("; ")}\n` +
          `Photo feedback: ${r.data.photo_feedback.map((p) => `#${p.photo_number} ${p.verdict}: ${p.comment}`).join(" | ")}`
        );
      }
    }

    if (reviewSummaries.length < 2) {
      return NextResponse.json(
        { error: "Need at least 2 successful reviews for consensus" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
    const MODELS = ["gemini-3.1-flash-lite", "gemini-3.1-flash", "gemini-2.5-flash"];

    const prompt = `You're synthesizing ${reviewSummaries.length} independent AI reviews of someone's Hinge dating profile. Each reviewer had the same persona but different AI models, so they saw the same profile independently.

Here are the reviews:

${reviewSummaries.join("\n\n---\n\n")}

Synthesize these into a consensus view. Be direct and casual - you're summarizing what a panel of reviewers agreed on. Don't hedge.

Respond with this JSON:

{
  "overall_consensus": "2-3 sentence summary of the overall vibe across all reviewers. Where do they land?",
  "agreed_strengths": ["Things 3+ reviewers liked - be specific"],
  "agreed_weaknesses": ["Things 3+ reviewers flagged as issues - be specific"],
  "controversial_points": ["Things where reviewers disagreed - note who said what"],
  "final_rating": <averaged rating rounded to nearest integer>,
  "priority_changes": ["Top 3-5 changes ranked by how many reviewers mentioned them and severity. Most impactful first."]
}`;

    let consensus = null;
    for (const modelId of MODELS) {
      try {
        console.log(`[consensus] Trying ${modelId}...`);
        const model = genAI.getGenerativeModel({
          model: modelId,
          generationConfig: {
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
          },
        });
        const result = await model.generateContent(prompt);
        const raw = result.response.text();
        // Extract JSON safely
        const start = raw.indexOf("{");
        const end = raw.lastIndexOf("}");
        if (start === -1 || end === -1) throw new Error("No JSON in response");
        consensus = JSON.parse(raw.slice(start, end + 1));
        break;
      } catch (err) {
        console.error(`[consensus] ${modelId} failed:`, err instanceof Error ? err.message : err);
      }
    }

    if (!consensus) {
      return NextResponse.json({ error: "All Gemini models failed" }, { status: 502 });
    }

    return NextResponse.json({ consensus });
  } catch (err) {
    console.error("[consensus] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate consensus" },
      { status: 500 }
    );
  }
}
