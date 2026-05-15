"use client";

import { useState } from "react";

interface PersonaInputProps {
  persona: string;
  onPersonaChange: (persona: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const AGE_RANGES = ["18-22", "23-26", "27-30", "31-35", "36-40", "40+"];
const GENDERS = ["Woman", "Man", "Non-binary"];

export function PersonaInput({
  persona,
  onPersonaChange,
  onGenerate,
  isGenerating,
}: PersonaInputProps) {
  const [mode, setMode] = useState<"quick" | "custom">("quick");
  const [quickFields, setQuickFields] = useState({
    ageRange: "23-26",
    gender: "Woman",
    city: "",
    vibe: "",
    lookingFor: "",
  });

  const quickFieldsValid =
    quickFields.city.trim() !== "" &&
    quickFields.vibe.trim() !== "" &&
    quickFields.lookingFor.trim() !== "";

  const handleQuickGenerate = async () => {
    try {
      const res = await fetch("/api/generate-persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quickFields),
      });
      const data = await res.json();
      if (data.persona) onPersonaChange(data.persona);
    } catch {
      // handled by parent
    }
    onGenerate();
  };

  return (
    <div className="w-full">
      <h2 className="font-serif text-3xl sm:text-4xl mb-2">
        Who&apos;s <span className="italic">judging</span> you?
      </h2>
      <p className="text-text-secondary text-sm mb-8">
        More specific = better feedback.
      </p>

      {/* Mode tabs */}
      <div className="flex border-b border-border mb-8">
        {(["quick", "custom"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`pb-3 px-1 mr-6 text-sm font-medium transition-all border-b-2 ${
              mode === m
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            {m === "quick" ? "Quick start" : "Write your own"}
          </button>
        ))}
      </div>

      {mode === "quick" ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide">
                Age range
              </label>
              <select
                value={quickFields.ageRange}
                onChange={(e) =>
                  setQuickFields({ ...quickFields, ageRange: e.target.value })
                }
                className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors text-sm"
              >
                {AGE_RANGES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide">
                Gender
              </label>
              <select
                value={quickFields.gender}
                onChange={(e) =>
                  setQuickFields({ ...quickFields, gender: e.target.value })
                }
                className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors text-sm"
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide">
              City
            </label>
            <input
              type="text"
              value={quickFields.city}
              onChange={(e) =>
                setQuickFields({ ...quickFields, city: e.target.value })
              }
              placeholder="San Francisco, NYC, London..."
              className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide">
              Vibe
            </label>
            <input
              type="text"
              value={quickFields.vibe}
              onChange={(e) =>
                setQuickFields({ ...quickFields, vibe: e.target.value })
              }
              placeholder="Artsy and outdoorsy, tech bro, corporate girlie..."
              className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wide">
              Looking for
            </label>
            <input
              type="text"
              value={quickFields.lookingFor}
              onChange={(e) =>
                setQuickFields({ ...quickFields, lookingFor: e.target.value })
              }
              placeholder="Something serious, casual but not boring..."
              className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors text-sm"
            />
          </div>

          {!persona && (
            <button
              onClick={handleQuickGenerate}
              disabled={!quickFieldsValid || isGenerating}
              className="w-full py-3.5 bg-text-primary text-bg-primary disabled:opacity-30 disabled:cursor-not-allowed font-medium rounded-full transition-all hover:bg-accent text-sm"
            >
              {isGenerating ? "Generating..." : "Build my reviewer"}
            </button>
          )}
        </div>
      ) : (
        <div>
          <textarea
            value={persona}
            onChange={(e) => onPersonaChange(e.target.value)}
            placeholder={`Write your reviewer's persona. Go deep – the more detail, the sharper the feedback.\n\nExample: "You're a 24-year-old Asian American woman in SF. Grew up in Cupertino, went to Stanford, now a PM at a Series B startup. You SoulCycle, brunch at Marlowe, and have strong opinions about Erewhon smoothies..."`}
            rows={10}
            className="w-full bg-bg-secondary border border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors resize-none text-sm leading-relaxed"
          />
          <p className="text-xs text-text-muted mt-2">
            {persona.length}/5000 characters
          </p>
        </div>
      )}

      {/* Persona preview */}
      {persona && (
        <div className="mt-8 border border-border rounded-xl p-6 bg-bg-secondary">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium uppercase tracking-wide text-accent">
              Your reviewer
            </p>
            <button
              onClick={() => onPersonaChange("")}
              className="text-xs text-text-muted hover:text-accent transition-colors"
            >
              Clear
            </button>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
            {persona.length > 500 ? persona.slice(0, 500) + "..." : persona}
          </p>
        </div>
      )}
    </div>
  );
}
