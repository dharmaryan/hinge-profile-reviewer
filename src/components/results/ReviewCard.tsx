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
      ? "text-rating-high border-rating-high/30 bg-rating-high/10"
      : rating >= 4
        ? "text-rating-mid border-rating-mid/30 bg-rating-mid/10"
        : "text-rating-low border-rating-low/30 bg-rating-low/10";

  return (
    <div
      className={`w-14 h-14 rounded-full border-2 flex items-center justify-center font-bold text-xl animate-count-up ${color}`}
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
    <div className="border-t border-glass-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
      >
        {title}
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
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
        <div className="w-14 h-14 rounded-full bg-bg-elevated" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-bg-elevated rounded-lg w-3/4" />
          <div className="h-3 bg-bg-elevated rounded-lg w-1/2" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-3 bg-bg-elevated rounded-lg" style={{ width: `${85 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function ReviewCard({ modelName, result, error, isLoading }: ReviewCardProps) {
  const displayName = MODEL_DISPLAY_NAMES[modelName];
  const color = MODEL_COLORS[modelName];

  return (
    <div className="glass-card p-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <h3 className="font-semibold">{displayName}</h3>
      </div>

      {isLoading && <Skeleton />}

      {error && (
        <div className="p-4 rounded-xl bg-rating-low/10 border border-rating-low/20">
          <p className="text-sm text-rating-low font-medium">
            Failed to get review
          </p>
          <p className="text-xs text-text-muted mt-1">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-0">
          {/* Rating + Gut Reaction */}
          <div className="flex items-start gap-4 mb-4">
            <RatingBadge rating={result.overall_rating} />
            <div className="flex-1">
              <p className="text-sm text-text-secondary mb-1">
                {result.rating_context}
              </p>
              <p className="text-sm font-medium">{result.gut_reaction}</p>
            </div>
          </div>

          {/* Swipe + Message */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-bg-secondary">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">
                  {result.swipe_right.answer === "yes" ? "👍" : "👎"}
                </span>
                <span className="text-xs font-medium text-text-secondary">
                  Swipe right?
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                {result.swipe_right.reason}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-bg-secondary">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">
                  {result.message_first.would_message_first ? "💬" : "⏳"}
                </span>
                <span className="text-xs font-medium text-text-secondary">
                  Message first?
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                {result.message_first.would_message_first
                  ? "Would message first"
                  : "Would wait"}
              </p>
            </div>
          </div>

          {/* Photos */}
          <Section title={`Photo Feedback (${result.photo_feedback.length})`} defaultOpen>
            <div className="space-y-3">
              {result.photo_feedback.map((p) => (
                <div key={p.photo_number} className="flex gap-3">
                  <div
                    className={`mt-0.5 px-2 py-0.5 rounded-md text-xs font-medium shrink-0 ${
                      p.verdict === "keep"
                        ? "bg-rating-high/10 text-rating-high"
                        : p.verdict === "replace"
                          ? "bg-rating-low/10 text-rating-low"
                          : "bg-rating-mid/10 text-rating-mid"
                    }`}
                  >
                    #{p.photo_number} {p.verdict}
                  </div>
                  <p className="text-sm text-text-secondary">{p.comment}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Prompts */}
          {result.prompt_feedback.length > 0 && (
            <Section title={`Prompt Feedback (${result.prompt_feedback.length})`}>
              <div className="space-y-3">
                {result.prompt_feedback.map((p, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                          p.verdict === "landing" || p.verdict === "actually funny"
                            ? "bg-rating-high/10 text-rating-high"
                            : p.verdict === "lazy" || p.verdict === "AI-written"
                              ? "bg-rating-low/10 text-rating-low"
                              : "bg-rating-mid/10 text-rating-mid"
                        }`}
                      >
                        {p.verdict}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted italic mb-1">
                      &ldquo;{p.prompt_text}&rdquo;
                    </p>
                    <p className="text-sm text-text-secondary">{p.comment}</p>
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
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                        ick.severity === "dealbreaker"
                          ? "bg-rating-low/10 text-rating-low"
                          : ick.severity === "major"
                            ? "bg-rating-mid/10 text-rating-mid"
                            : "bg-bg-elevated text-text-muted"
                      }`}
                    >
                      {ick.severity}
                    </span>
                    <span className="text-sm text-text-secondary">
                      {ick.ick}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Messaging */}
          <Section title="Messaging Dynamics">
            <div className="space-y-2 text-sm text-text-secondary">
              <p>
                <strong className="text-text-primary">Generic opener?</strong>{" "}
                {result.message_first.generic_opener_response}
              </p>
              <p>
                <strong className="text-text-primary">
                  What would land:
                </strong>{" "}
                {result.message_first.what_would_get_a_response}
              </p>
            </div>
          </Section>

          {/* Top 3 Changes */}
          <Section title="Top 3 Changes" defaultOpen>
            <ol className="space-y-2">
              {result.top_3_changes.map((change, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-accent-rose font-mono font-bold shrink-0">
                    {i + 1}.
                  </span>
                  <span className="text-text-secondary">{change}</span>
                </li>
              ))}
            </ol>
          </Section>
        </div>
      )}
    </div>
  );
}
