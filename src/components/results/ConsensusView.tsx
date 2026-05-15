"use client";

import { useState } from "react";
import { ReviewResponse } from "@/lib/ai/types";

interface ConsensusViewProps {
  results: ReviewResponse;
}

interface ConsensusData {
  overall_consensus: string;
  agreed_strengths: string[];
  agreed_weaknesses: string[];
  controversial_points: string[];
  final_rating: number;
  priority_changes: string[];
}

export function ConsensusView({ results }: ConsensusViewProps) {
  const [consensus, setConsensus] = useState<ConsensusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConsensus = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/consensus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results }),
      });

      if (!res.ok) throw new Error(`Failed: ${res.status}`);

      const data = await res.json();
      setConsensus(data.consensus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Not yet loaded - show CTA
  if (!consensus && !loading && !error) {
    return (
      <div className="border border-border rounded-xl p-8 bg-bg-secondary text-center">
        <h3 className="font-serif text-2xl mb-2">
          What do they <span className="italic">all</span> think?
        </h3>
        <p className="text-sm text-text-secondary mb-6 max-w-sm mx-auto">
          Gemini Flash reads all 4 reviews and pulls out where they agree,
          disagree, and what to actually fix first.
        </p>
        <button
          onClick={fetchConsensus}
          className="px-6 py-3 bg-text-primary text-bg-primary font-medium rounded-full text-sm transition-all hover:bg-accent"
        >
          Generate consensus
        </button>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="border border-border rounded-xl p-8 bg-bg-secondary flex flex-col items-center gap-4">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-text-secondary">Synthesizing 4 reviews...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="border border-border rounded-xl p-8 bg-bg-secondary text-center">
        <p className="text-sm text-rating-low mb-4">{error}</p>
        <button
          onClick={fetchConsensus}
          className="px-6 py-3 border border-border text-text-secondary font-medium rounded-full text-sm hover:text-text-primary hover:border-border-hover transition-all"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!consensus) return null;

  // Results
  const ratingColor =
    consensus.final_rating >= 7
      ? "text-rating-high border-rating-high/30"
      : consensus.final_rating >= 4
        ? "text-rating-mid border-rating-mid/30"
        : "text-rating-low border-rating-low/30";

  return (
    <div className="border border-border rounded-xl p-6 bg-bg-secondary space-y-6">
      {/* Header + rating */}
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-semibold text-lg ${ratingColor}`}
        >
          {consensus.final_rating}
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-accent mb-1">
            Consensus
          </p>
          <p className="text-sm leading-relaxed">{consensus.overall_consensus}</p>
        </div>
      </div>

      {/* Agreed strengths */}
      {consensus.agreed_strengths.length > 0 && (
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3">
            Everyone liked
          </h4>
          <ul className="space-y-2">
            {consensus.agreed_strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-rating-high shrink-0">+</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Agreed weaknesses */}
      {consensus.agreed_weaknesses.length > 0 && (
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3">
            Everyone flagged
          </h4>
          <ul className="space-y-2">
            {consensus.agreed_weaknesses.map((w, i) => (
              <li key={i} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-rating-low shrink-0">-</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Controversial */}
      {consensus.controversial_points.length > 0 && (
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3">
            Split opinions
          </h4>
          <ul className="space-y-2">
            {consensus.controversial_points.map((c, i) => (
              <li key={i} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-rating-mid shrink-0">~</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Priority changes */}
      <div className="border-t border-border pt-5">
        <h4 className="text-xs font-medium uppercase tracking-wide text-text-muted mb-3">
          What to fix first
        </h4>
        <ol className="space-y-2">
          {consensus.priority_changes.map((c, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="text-accent font-mono font-medium shrink-0">
                {i + 1}.
              </span>
              <span className="text-text-secondary leading-relaxed">{c}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
