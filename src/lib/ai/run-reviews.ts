import { reviewWithClaude } from "./claude";
import { reviewWithChatGPT } from "./openai";
import { reviewWithGemini } from "./gemini";
import { reviewWithGrok } from "./grok";
import { ModelReviewResult, ReviewResponse } from "./types";

async function wrapReview(
  fn: () => Promise<unknown>
): Promise<ModelReviewResult> {
  try {
    const data = await fn();
    return { status: "fulfilled", data: data as ModelReviewResult["data"] };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { status: "rejected", error: message };
  }
}

export async function runAllReviews(
  images: string[],
  persona: string
): Promise<ReviewResponse> {
  const [claude, chatgpt, gemini, grok] = await Promise.all([
    wrapReview(() => reviewWithClaude(images, persona)),
    wrapReview(() => reviewWithChatGPT(images, persona)),
    wrapReview(() => reviewWithGemini(images, persona)),
    wrapReview(() => reviewWithGrok(images, persona)),
  ]);

  return { results: { claude, chatgpt, gemini, grok } };
}
