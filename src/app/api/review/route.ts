import { NextRequest, NextResponse } from "next/server";
import { reviewRequestSchema } from "@/lib/validation";
import { runAllReviews } from "@/lib/ai/run-reviews";
import { ReviewResponse } from "@/lib/ai/types";

export const maxDuration = 120;

// In-memory job store. Fine for MVP - jobs auto-expire after 10 minutes.
const jobs = new Map<
  string,
  { status: "running" | "done"; results?: ReviewResponse; createdAt: number }
>();

// Clean up old jobs every request
function cleanOldJobs() {
  const tenMinutes = 10 * 60 * 1000;
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (now - job.createdAt > tenMinutes) jobs.delete(id);
  }
}

// POST - start a review job
export async function POST(req: NextRequest) {
  cleanOldJobs();

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
    const jobId = crypto.randomUUID();

    console.log(
      `[review] Job ${jobId}: Starting with ${images.length} images, persona length: ${persona.length}`
    );
    console.log(
      `[review] API keys present: anthropic=${!!process.env.ANTHROPIC_API_KEY}, openai=${!!process.env.OPENAI_API_KEY}, google=${!!process.env.GOOGLE_AI_API_KEY}, xai=${!!process.env.XAI_API_KEY}`
    );

    jobs.set(jobId, { status: "running", createdAt: Date.now() });

    // Fire and don't await - let it run in the background
    runAllReviews(images, persona)
      .then((results) => {
        console.log(
          `[review] Job ${jobId}: Done. Claude: ${results.results.claude.status}, ChatGPT: ${results.results.chatgpt.status}, Gemini: ${results.results.gemini.status}, Grok: ${results.results.grok.status}`
        );
        const job = jobs.get(jobId);
        if (job) {
          job.status = "done";
          job.results = results;
        }
      })
      .catch((err) => {
        console.error(`[review] Job ${jobId}: Unhandled error:`, err);
        const job = jobs.get(jobId);
        if (job) {
          job.status = "done";
          job.results = {
            results: {
              claude: { status: "rejected", error: "Server error" },
              chatgpt: { status: "rejected", error: "Server error" },
              gemini: { status: "rejected", error: "Server error" },
              grok: { status: "rejected", error: "Server error" },
            },
          };
        }
      });

    return NextResponse.json({ jobId });
  } catch (err) {
    console.error("[review] Unhandled error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to start review" },
      { status: 500 }
    );
  }
}

// GET - poll for job results
export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  const job = jobs.get(jobId);

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.status === "running") {
    return NextResponse.json({ status: "running" });
  }

  // Done - return results and clean up
  const results = job.results;
  jobs.delete(jobId);
  return NextResponse.json({ status: "done", ...results });
}
