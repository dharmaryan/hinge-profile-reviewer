import { reviewWithClaude } from "./claude";
import { reviewWithChatGPT } from "./openai";
import { reviewWithGemini } from "./gemini";
import { reviewWithGrok } from "./grok";
import { ModelReviewResult, ReviewResponse } from "./types";

async function wrapReview(
  name: string,
  fn: () => Promise<unknown>
): Promise<ModelReviewResult> {
  try {
    console.log(`[${name}] Starting...`);
    const data = await fn();
    console.log(`[${name}] Success`);
    return { status: "fulfilled", data: data as ModelReviewResult["data"] };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[${name}] Failed:`, message);
    return { status: "rejected", error: message };
  }
}

export async function runAllReviews(
  images: string[],
  persona: string
): Promise<ReviewResponse> {
  const [claude, chatgpt, gemini, grok] = await Promise.all([
    wrapReview("claude", () => reviewWithClaude(images, persona)),
    wrapReview("chatgpt", () => reviewWithChatGPT(images, persona)),
    wrapReview("gemini", () => reviewWithGemini(images, persona)),
    wrapReview("grok", () => reviewWithGrok(images, persona)),
  ]);

  return { results: { claude, chatgpt, gemini, grok } };
}
