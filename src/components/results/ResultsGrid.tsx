"use client";

import { useState } from "react";
import { ReviewResponse, ModelName } from "@/lib/ai/types";
import { ReviewCard } from "./ReviewCard";
import { ConsensusView } from "./ConsensusView";

interface ResultsGridProps {
  results: ReviewResponse | null;
  isLoading: boolean;
}

const MODEL_ORDER: ModelName[] = ["claude", "chatgpt", "gemini", "grok"];

export function ResultsGrid({ results, isLoading }: ResultsGridProps) {
  const [tab, setTab] = useState<"individual" | "consensus">("individual");

  const hasResults = results && Object.values(results.results).some(
    (r) => r.status === "fulfilled"
  );

  return (
    <div className="w-full">
      <h2 className="font-serif text-3xl sm:text-4xl mb-2">
        The <span className="italic">verdict</span>
      </h2>
      <p className="text-text-secondary text-sm mb-6">
        4 models, no shared context, no pulled punches.
      </p>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-border" />
            <div className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-text-secondary">
            Running 4 models in parallel. This takes 15-30s.
          </p>
        </div>
      )}

      {/* Tabs - only show when we have results */}
      {!isLoading && hasResults && (
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

      {/* Individual reviews */}
      {!isLoading && tab === "individual" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {MODEL_ORDER.map((model) => {
            const modelResult = results?.results[model];
            return (
              <ReviewCard
                key={model}
                modelName={model}
                result={modelResult?.data}
                error={
                  modelResult?.status === "rejected"
                    ? modelResult.error
                    : undefined
                }
                isLoading={false}
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
