"use client";

import { useState } from "react";
import {
  ReviewResult,
  ModelName,
  MODEL_DISPLAY_NAMES,
  MODEL_COLORS,
} from "@/lib/ai/types";

interface ReviewCardProps {
  modelName: ModelName;
  result?: ReviewResult;
  error?: string;
  isLoading: boolean;
}

function RatingBadge({ rating }: { rating: number }) {
  const color =
    rating >= 7
      ? "text-rating-high border-rating-high/30"
      : rating >= 4
        ? "text-rating-mid border-rating-mid/30"
        : "text-rating-low border-rating-low/30";

  return (
    <div
      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-semibold text-lg animate-count-up ${color}`}
    >
      {rating}
    </div>
  );
}

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
      >
        {title}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-bg-elevated" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-bg-elevated rounded w-3/4" />
          <div className="h-3 bg-bg-elevated rounded w-1/2" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-3 bg-bg-elevated rounded" style={{ width: `${85 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function ReviewCard({ modelName, result, error, isLoading }: ReviewCardProps) {
  const displayName = MODEL_DISPLAY_NAMES[modelName];
  const color = MODEL_COLORS[modelName];

  return (
    <div className="border border-border rounded-xl p-6 bg-bg-secondary animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="font-medium text-sm">{displayName}</h3>
      </div>

      {isLoading && <Skeleton />}

      {error && (
        <div className="p-4 rounded-lg bg-rating-low/5 border border-rating-low/15">
          <p className="text-sm text-rating-low font-medium">Couldn&apos;t get this one</p>
          <p className="text-xs text-text-muted mt-1">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-0">
          {/* Rating + Gut Reaction */}
          <div className="flex items-start gap-4 mb-5">
            <RatingBadge rating={result.overall_rating} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-muted mb-1">{result.rating_context}</p>
              <p className="text-sm font-medium leading-snug">{result.gut_reaction}</p>
            </div>
          </div>

          {/* Swipe + Message */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-lg bg-bg-elevated">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-base">{result.swipe_right.answer === "yes" ? "👍" : "👎"}</span>
                <span className="text-xs font-medium text-text-muted">Swipe?</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{result.swipe_right.reason}</p>
            </div>
            <div className="p-3 rounded-lg bg-bg-elevated">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-base">{result.message_first.would_message_first ? "💬" : "⏳"}</span>
                <span className="text-xs font-medium text-text-muted">Message?</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {result.message_first.would_message_first ? "I'd message first" : "I'd wait"}
              </p>
            </div>
          </div>

          {/* Photos */}
          <Section title={`Photos (${result.photo_feedback.length})`} defaultOpen>
            <div className="space-y-3">
              {result.photo_feedback.map((p) => (
                <div key={p.photo_number} className="flex gap-3">
                  <span
                    className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 uppercase tracking-wide ${
                      p.verdict === "keep"
                        ? "bg-rating-high/10 text-rating-high"
                        : p.verdict === "replace"
                          ? "bg-rating-low/10 text-rating-low"
                          : "bg-rating-mid/10 text-rating-mid"
                    }`}
                  >
                    #{p.photo_number} {p.verdict}
                  </span>
                  <p className="text-sm text-text-secondary leading-relaxed">{p.comment}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Prompts */}
          {result.prompt_feedback.length > 0 && (
            <Section title={`Prompts (${result.prompt_feedback.length})`}>
              <div className="space-y-3">
                {result.prompt_feedback.map((p, i) => (
                  <div key={i}>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide mb-1 ${
                        p.verdict === "landing" || p.verdict === "actually funny"
                          ? "bg-rating-high/10 text-rating-high"
                          : p.verdict === "lazy" || p.verdict === "AI-written"
                            ? "bg-rating-low/10 text-rating-low"
                            : "bg-rating-mid/10 text-rating-mid"
                      }`}
                    >
                      {p.verdict}
                    </span>
                    <p className="text-xs text-text-muted italic mb-1">&ldquo;{p.prompt_text}&rdquo;</p>
                    <p className="text-sm text-text-secondary leading-relaxed">{p.comment}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Icks */}
          {result.icks.length > 0 && (
            <Section title={`Icks (${result.icks.length})`}>
              <div className="space-y-2">
                {result.icks.map((ick, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide shrink-0 ${
                        ick.severity === "dealbreaker"
                          ? "bg-rating-low/10 text-rating-low"
                          : ick.severity === "major"
                            ? "bg-rating-mid/10 text-rating-mid"
                            : "bg-bg-elevated text-text-muted"
                      }`}
                    >
                      {ick.severity}
                    </span>
                    <span className="text-sm text-text-secondary">{ick.ick}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Messaging */}
          <Section title="Openers">
            <div className="space-y-2 text-sm text-text-secondary">
              <p>
                <span className="font-medium text-text-primary">Reply to a &quot;hey&quot;?</span>{" "}
                {result.message_first.generic_opener_response}
              </p>
              <p>
                <span className="font-medium text-text-primary">What&apos;d actually work:</span>{" "}
                {result.message_first.what_would_get_a_response}
              </p>
            </div>
          </Section>

          {/* Top 3 */}
          <Section title="Biggest moves" defaultOpen>
            <ol className="space-y-2">
              {result.top_3_changes.map((change, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-accent font-mono font-medium shrink-0">{i + 1}.</span>
                  <span className="text-text-secondary leading-relaxed">{change}</span>
                </li>
              ))}
            </ol>
          </Section>
        </div>
      )}
    </div>
  );
}
