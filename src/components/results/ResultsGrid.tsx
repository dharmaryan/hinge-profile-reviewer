"use client";

import { ReviewResponse, ModelName } from "@/lib/ai/types";
import { ReviewCard } from "./ReviewCard";

interface ResultsGridProps {
  results: ReviewResponse | null;
  isLoading: boolean;
}

const MODEL_ORDER: ModelName[] = ["claude", "chatgpt", "gemini", "grok"];

export function ResultsGrid({ results, isLoading }: ResultsGridProps) {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">Your Reviews</h3>
      <p className="text-sm text-text-secondary mb-6">
        4 independent AI reviewers, no shared context, no averaging.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {MODEL_ORDER.map((model, i) => {
          const modelResult = results?.results[model];
          return (
            <div key={model} className={`delay-${(i + 1) * 100}`}>
              <ReviewCard
                modelName={model}
                result={modelResult?.data}
                error={modelResult?.status === "rejected" ? modelResult.error : undefined}
                isLoading={isLoading}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
