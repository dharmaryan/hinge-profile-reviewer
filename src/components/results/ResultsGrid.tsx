"use client";

import { useState } from "react";
import { ReviewResponse, ModelName } from "@/lib/ai/types";
import { ReviewCard } from "./ReviewCard";
import { ConsensusView } from "./ConsensusView";

interface ResultsGridProps {
  results: ReviewResponse | null;
  isLoading: boolean;
  modelsCompleted?: number;
}

const MODEL_ORDER: ModelName[] = ["claude", "chatgpt", "gemini", "grok"];

export function ResultsGrid({ results, isLoading, modelsCompleted = 0 }: ResultsGridProps) {
  const [tab, setTab] = useState<"individual" | "consensus">("individual");

  const hasAnyResult = results && Object.values(results.results).some(
    (r) => r.status === "fulfilled"
  );

  const allDone = !isLoading && hasAnyResult;

  return (
    <div className="w-full">
      <h2 className="font-serif text-3xl sm:text-4xl mb-2">
        The <span className="italic">verdict</span>
      </h2>

      {/* Progress indicator while streaming */}
      {isLoading && (
        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-5 h-5 shrink-0">
            <div className="absolute inset-0 rounded-full border-2 border-border" />
            <div className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-text-secondary">
            {modelsCompleted}/4 done. Results show up as each model finishes.
          </p>
        </div>
      )}

      {!isLoading && (
        <p className="text-text-secondary text-sm mb-6">
          4 models, no shared context, no pulled punches.
        </p>
      )}

      {/* Tabs - show once at least one result is in */}
      {allDone && (
        <div className="flex border-b border-border mb-6">
          {(["individual", "consensus"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 px-1 mr-6 text-sm font-medium transition-all border-b-2 ${
                tab === t
                  ? "border-accent text-accent"
                  : "border-transparent text-text-muted hover:text-text-secondary"
              }`}
            >
              {t === "individual" ? "Individual" : "Consensus"}
            </button>
          ))}
        </div>
      )}

      {/* Individual reviews - always show during streaming */}
      {(tab === "individual" || isLoading) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {MODEL_ORDER.map((model) => {
            const modelResult = results?.results[model];
            const isWaiting = modelResult?.error === "Waiting...";
            const hasFailed = modelResult?.status === "rejected" && !isWaiting;
            return (
              <ReviewCard
                key={model}
                modelName={model}
                result={modelResult?.data}
                error={hasFailed ? modelResult.error : undefined}
                isLoading={isLoading && isWaiting}
              />
            );
          })}
        </div>
      )}

      {/* Consensus view */}
      {!isLoading && tab === "consensus" && results && (
        <ConsensusView results={results} />
      )}
    </div>
  );
}
