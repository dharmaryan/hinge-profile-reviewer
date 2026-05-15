"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ImageUploader } from "@/components/upload/ImageUploader";
import { PersonaInput } from "@/components/persona/PersonaInput";
import { ResultsGrid } from "@/components/results/ResultsGrid";
import { ReviewResponse } from "@/lib/ai/types";

type Step = "upload" | "persona" | "results";

const STEPS: { key: Step; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "persona", label: "Reviewer" },
  { key: "results", label: "Results" },
];

export default function ReviewPage() {
  const [step, setStep] = useState<Step>("upload");
  const [images, setImages] = useState<string[]>([]);
  const [persona, setPersona] = useState("");
  const [isGeneratingPersona, setIsGeneratingPersona] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [results, setResults] = useState<ReviewResponse | null>(null);

  const handleStartReview = useCallback(async () => {
    setStep("results");
    setIsReviewing(true);
    setResults(null);

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, persona }),
      });

      if (!res.ok) {
        throw new Error(`Review failed: ${res.status}`);
      }

      const data: ReviewResponse = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Review error:", err);
      setResults({
        results: {
          claude: { status: "rejected", error: "Request failed" },
          chatgpt: { status: "rejected", error: "Request failed" },
          gemini: { status: "rejected", error: "Request failed" },
          grok: { status: "rejected", error: "Request failed" },
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
  };

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <main className="flex-1 flex flex-col min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-xl border-b border-glass-border">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            &larr; Back
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full transition-all ${
                    i <= currentStepIndex
                      ? "bg-accent-rose"
                      : "bg-text-muted/30"
                  }`}
                />
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-6 h-px transition-all ${
                      i < currentStepIndex
                        ? "bg-accent-rose"
                        : "bg-text-muted/20"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <span className="text-sm text-text-muted">{STEPS[currentStepIndex].label}</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 py-8">
        <div className="w-full max-w-2xl">
          {/* Upload step */}
          {step === "upload" && (
            <div className="animate-fade-in-up">
              <ImageUploader
                images={images}
                onImagesChange={setImages}
              />

              <div className="mt-8">
                <button
                  onClick={() => setStep("persona")}
                  disabled={images.length === 0}
                  className="w-full py-4 bg-accent-rose hover:bg-accent-pink disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all text-lg"
                >
                  Next: Pick Your Reviewer
                </button>
              </div>
            </div>
          )}

          {/* Persona step */}
          {step === "persona" && (
            <div className="animate-fade-in-up">
              <PersonaInput
                persona={persona}
                onPersonaChange={setPersona}
                onGenerate={() => setIsGeneratingPersona(false)}
                isGenerating={isGeneratingPersona}
              />

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setStep("upload")}
                  className="px-6 py-4 border border-glass-border text-text-secondary hover:text-text-primary hover:border-text-muted rounded-2xl transition-all font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleStartReview}
                  disabled={persona.length < 50}
                  className="flex-1 py-4 bg-accent-rose hover:bg-accent-pink disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all text-lg"
                >
                  Get Reviewed by 4 AIs
                </button>
              </div>
            </div>
          )}

          {/* Results step */}
          {step === "results" && (
            <div className="animate-fade-in-up">
              <ResultsGrid results={results} isLoading={isReviewing} />

              <div className="mt-8 flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-4 border border-glass-border text-text-secondary hover:text-text-primary hover:border-accent-rose rounded-2xl transition-all font-semibold text-lg"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
