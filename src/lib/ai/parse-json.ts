import { ReviewResult } from "./types";

/**
 * Extracts and parses JSON from AI model responses.
 * Handles markdown fencing, trailing text, and other common issues.
 */
export function parseReviewJSON(raw: string): ReviewResult {
  let text = raw.trim();

  // Strip markdown code fences
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");

  // Find the JSON object - grab from first { to last }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in response");
  }

  text = text.slice(start, end + 1);

  return JSON.parse(text) as ReviewResult;
}
