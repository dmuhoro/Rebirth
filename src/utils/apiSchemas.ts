import { z } from "zod";

/**
 * Zod schemas for Rebirth API request/response validation (Phase 2).
 * Fail closed: invalid payloads are rejected before reaching Gemini.
 */

export const SpiritualGuidanceRequestSchema = z.object({
  entryText: z.string().min(1, "entryText is required").max(5000, "entryText too long"),
  theme: z.enum(["spiritual_strength", "repentance_transformation", "divinity_of_christ", "general"]).optional(),
  emotion: z.string().max(100, "emotion too long").optional(),
});

export type SpiritualGuidanceRequest = z.infer<typeof SpiritualGuidanceRequestSchema>;

export const DailyContemplationRequestSchema = z.object({
  fresh: z.union([z.literal("true"), z.literal("false"), z.boolean()]).optional(),
});

export type DailyContemplationRequest = z.infer<typeof DailyContemplationRequestSchema>;

/**
 * Sanitizes an error message for client consumption. Never leak stack traces,
 * API keys, or provider internals to the client.
 */
export function sanitizeError(error: unknown): { message: string; code: string } {
  if (error instanceof Error) {
    // Provider/internal errors degrade to a generic message + incident id.
    return {
      message: "Could not complete your request. Please try again.",
      code: "INTERNAL_ERROR",
    };
  }
  return { message: "An unexpected error occurred.", code: "INTERNAL_ERROR" };
}
