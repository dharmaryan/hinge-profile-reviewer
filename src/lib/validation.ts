import { z } from "zod";

export const personaInputSchema = z.object({
  ageRange: z.string().min(1),
  gender: z.string().min(1),
  city: z.string().min(1),
  vibe: z.string().min(1),
  lookingFor: z.string().min(1),
});

export const reviewRequestSchema = z.object({
  images: z
    .array(z.string().min(1))
    .min(1, "At least 1 image is required")
    .max(6, "Maximum 6 images allowed"),
  persona: z
    .string()
    .min(50, "Persona must be at least 50 characters")
    .max(5000, "Persona must be under 5000 characters"),
});
