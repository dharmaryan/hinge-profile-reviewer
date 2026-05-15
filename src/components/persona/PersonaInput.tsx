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
      if (data.persona) {
        onPersonaChange(data.persona);
      }
    } catch {
      // Error handled by parent
    }
    onGenerate();
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-2">Who&apos;s reviewing you?</h3>
      <p className="text-sm text-text-secondary mb-6">
        Define the persona of your reviewer. The more specific, the better the
        feedback.
      </p>

      {/* Mode tabs */}
      <div className="flex gap-1 p-1 bg-bg-secondary rounded-xl mb-6">
        {(["quick", "custom"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              mode === m
                ? "bg-accent-rose text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {m === "quick" ? "Quick Start" : "Write Your Own"}
          </button>
        ))}
      </div>

      {mode === "quick" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">
                Age Range
              </label>
              <select
                value={quickFields.ageRange}
                onChange={(e) =>
                  setQuickFields({ ...quickFields, ageRange: e.target.value })
                }
                className="w-full bg-bg-secondary border border-glass-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent-rose/50 transition-colors"
              >
                {AGE_RANGES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">
                Gender
              </label>
              <select
                value={quickFields.gender}
                onChange={(e) =>
                  setQuickFields({ ...quickFields, gender: e.target.value })
                }
                className="w-full bg-bg-secondary border border-glass-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent-rose/50 transition-colors"
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">
              City
            </label>
            <input
              type="text"
              value={quickFields.city}
              onChange={(e) =>
                setQuickFields({ ...quickFields, city: e.target.value })
              }
              placeholder="e.g. San Francisco, NYC, London"
              className="w-full bg-bg-secondary border border-glass-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-rose/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">
              Vibe
            </label>
            <input
              type="text"
              value={quickFields.vibe}
              onChange={(e) =>
                setQuickFields({ ...quickFields, vibe: e.target.value })
              }
              placeholder="e.g. artsy and outdoorsy, tech bro, corporate girlie"
              className="w-full bg-bg-secondary border border-glass-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-rose/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">
              Looking for
            </label>
            <input
              type="text"
              value={quickFields.lookingFor}
              onChange={(e) =>
                setQuickFields({ ...quickFields, lookingFor: e.target.value })
              }
              placeholder="e.g. something serious, casual but not boring"
              className="w-full bg-bg-secondary border border-glass-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-rose/50 transition-colors"
            />
          </div>

          {!persona && (
            <button
              onClick={handleQuickGenerate}
              disabled={!quickFieldsValid || isGenerating}
              className="w-full py-3.5 bg-accent-rose hover:bg-accent-pink disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate My Reviewer"
              )}
            </button>
          )}
        </div>
      ) : (
        <div>
          <textarea
            value={persona}
            onChange={(e) => onPersonaChange(e.target.value)}
            placeholder={`Describe your ideal reviewer in detail. The more specific, the better.\n\nExample: "You are a 24-year-old Asian American woman living in San Francisco. You grew up in the Bay Area, went to Stanford, and now work as a PM at a mid-stage startup..."`}
            rows={12}
            className="w-full bg-bg-secondary border border-glass-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-rose/50 transition-colors resize-none"
          />
          <p className="text-xs text-text-muted mt-2">
            {persona.length}/5000 characters
          </p>
        </div>
      )}

      {/* Persona preview */}
      {persona && (
        <div className="mt-6 glass-card p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-accent-rose">
              Your Reviewer
            </h4>
            <button
              onClick={() => onPersonaChange("")}
              className="text-xs text-text-muted hover:text-accent-rose transition-colors"
            >
              Clear & redo
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
