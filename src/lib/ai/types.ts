export interface PersonaInput {
  ageRange: string;
  gender: string;
  city: string;
  vibe: string;
  lookingFor: string;
}

export interface PhotoFeedback {
  photo_number: number;
  verdict: "keep" | "replace" | "move";
  comment: string;
}

export interface PromptFeedback {
  prompt_text: string;
  verdict: "landing" | "lazy" | "trying too hard" | "actually funny" | "AI-written";
  comment: string;
}

export interface Ick {
  ick: string;
  severity: "minor" | "major" | "dealbreaker";
}

export interface ReviewResult {
  gut_reaction: string;
  photo_feedback: PhotoFeedback[];
  prompt_feedback: PromptFeedback[];
  icks: Ick[];
  overall_rating: number;
  rating_context: string;
  swipe_right: {
    answer: "yes" | "no";
    reason: string;
  };
  message_first: {
    would_message_first: boolean;
    generic_opener_response: string;
    what_would_get_a_response: string;
  };
  top_3_changes: string[];
}

export interface ModelReviewResult {
  status: "fulfilled" | "rejected";
  data?: ReviewResult;
  error?: string;
}

export interface ReviewResponse {
  results: {
    claude: ModelReviewResult;
    chatgpt: ModelReviewResult;
    gemini: ModelReviewResult;
    grok: ModelReviewResult;
  };
}

export type ModelName = "claude" | "chatgpt" | "gemini" | "grok";

export const MODEL_DISPLAY_NAMES: Record<ModelName, string> = {
  claude: "Claude",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  grok: "Grok",
};

export const MODEL_COLORS: Record<ModelName, string> = {
  claude: "#D97706",
  chatgpt: "#10A37F",
  gemini: "#4285F4",
  grok: "#1DA1F2",
};
