"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ImageUploader } from "@/components/upload/ImageUploader";
import { PersonaInput } from "@/components/persona/PersonaInput";
import { ResultsGrid } from "@/components/results/ResultsGrid";
import { ReviewResponse, ModelName } from "@/lib/ai/types";

type Step = "upload" | "persona" | "results";

const STEPS: { key: Step; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "persona", label: "Reviewer" },
  { key: "results", label: "Results" },
];

const EMPTY_RESULTS: ReviewResponse = {
  results: {
    claude: { status: "rejected", error: "Waiting..." },
    chatgpt: { status: "rejected", error: "Waiting..." },
    gemini: { status: "rejected", error: "Waiting..." },
    grok: { status: "rejected", error: "Waiting..." },
  },
};

export default function ReviewPage() {
  const [step, setStep] = useState<Step>("upload");
  const [images, setImages] = useState<string[]>([]);
  const [persona, setPersona] = useState("");
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [results, setResults] = useState<ReviewResponse | null>(null);
  const [modelsCompleted, setModelsCompleted] = useState(0);

  const handleStartReview = useCallback(async () => {
    setStep("results");
    setIsReviewing(true);
    setResults({ ...EMPTY_RESULTS });
    setModelsCompleted(0);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, persona }),
      });

      if (!res.ok || !res.body) throw new Error(`Request failed: ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            const model = parsed.model as ModelName;
            setResults((prev) => {
              if (!prev) return prev;
              return {
                results: {
                  ...prev.results,
                  [model]: {
                    status: parsed.status,
                    data: parsed.data,
                    error: parsed.error,
                  },
                },
              };
            });
            setModelsCompleted((c) => c + 1);
          } catch {
            // Partial JSON line, ignore
          }
        }
      }
    } catch (err) {
      console.error("Review error:", err);
      setResults({
        results: {
          claude: { status: "rejected", error: "Connection lost" },
          chatgpt: { status: "rejected", error: "Connection lost" },
          gemini: { status: "rejected", error: "Connection lost" },
          grok: { status: "rejected", error: "Connection lost" },
        },
      });
    } finally {
      setIsReviewing(false);
    }
  }, [images, persona]);

  const handleReset = () => {
    setStep("upload");
    setImages([]);
    setPersona("");
    setResults(null);
    setIsReviewing(false);
    setIsGeneratingPersona(false);
    setModelsCompleted(0);
  };

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-bg-primary/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            &larr; Back
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-3">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i <= currentStepIndex
                        ? "bg-accent"
                        : "bg-border"
                    }`}
                  />
                  <span
                    className={`text-xs transition-colors ${
                      i === currentStepIndex
                        ? "text-text-primary font-medium"
                        : "text-text-muted"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-px ${
                      i < currentStepIndex ? "bg-accent" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="w-12" />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 py-10">
        <div className="w-full max-w-2xl">
          {step === "upload" && (
            <div className="animate-fade-in-up">
              <ImageUploader images={images} onImagesChange={setImages} />
              <div className="mt-10">
                <button
                  onClick={() => setStep("persona")}
                  disabled={images.length === 0}
                  className="w-full py-4 bg-text-primary text-bg-primary disabled:opacity-30 disabled:cursor-not-allowed font-medium rounded-full transition-all hover:bg-accent text-base"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === "persona" && (
            <div className="animate-fade-in-up">
              <PersonaInput
                persona={persona}
                onPersonaChange={setPersona}
                onGenerate={() => setIsGeneratingPersona(false)}
                isGenerating={isGeneratingPersona}
              />
              <div className="mt-10 flex gap-3">
                <button
                  onClick={() => setStep("upload")}
                  className="px-6 py-4 border border-border text-text-secondary hover:text-text-primary hover:border-border-hover rounded-full transition-all font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleStartReview}
                  disabled={persona.length < 50}
                  className="flex-1 py-4 bg-text-primary text-bg-primary disabled:opacity-30 disabled:cursor-not-allowed font-medium rounded-full transition-all hover:bg-accent text-base"
                >
                  Run it
                </button>
              </div>
            </div>
          )}

          {step === "results" && (
            <div className="animate-fade-in-up">
              <ResultsGrid
                results={results}
                isLoading={isReviewing}
                modelsCompleted={modelsCompleted}
              />
              {!isReviewing && (
                <div className="mt-10">
                  <button
                    onClick={handleReset}
                    className="w-full py-4 border border-border text-text-secondary hover:text-text-primary hover:border-text-primary rounded-full transition-all font-medium text-base"
                  >
                    Go again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
