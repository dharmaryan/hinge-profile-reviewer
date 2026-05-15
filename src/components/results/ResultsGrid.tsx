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
      <h2 className="font-serif text-3xl sm:text-4xl mb-2">
        The <span className="italic">verdict</span>
      </h2>
      <p className="text-text-secondary text-sm mb-8">
        4 models, no shared context, no pulled punches.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {MODEL_ORDER.map((model) => {
          const modelResult = results?.results[model];
          return (
            <ReviewCard
              key={model}
              modelName={model}
              result={modelResult?.data}
              error={modelResult?.status === "rejected" ? modelResult.error : undefined}
              isLoading={isLoading}
            />
          );
        })}
      </div>
    </div>
  );
}
