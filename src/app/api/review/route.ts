import { NextRequest, NextResponse } from "next/server";
import { reviewRequestSchema } from "@/lib/validation";
import { runAllReviews } from "@/lib/ai/run-reviews";

export const maxDuration = 60;

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
    const results = await runAllReviews(images, persona);

    return NextResponse.json(results);
  } catch (err) {
    console.error("Review error:", err);
    return NextResponse.json(
      { error: "Failed to run reviews" },
      { status: 500 }
    );
  }
}
