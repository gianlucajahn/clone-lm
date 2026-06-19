import Anthropic from "@anthropic-ai/sdk";

/**
 * Server-only Anthropic client. Sonnet for writing-heavy work (chat, reports),
 * Haiku for cheap structured JSON (mindmap, quiz, flashcards, data table,
 * infographic, follow-up suggestions, structuring search results).
 */
export const MODELS = {
  writing: "claude-sonnet-4-6",
  structured: "claude-haiku-4-5",
} as const;

let cached: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set in .env.local.");
  }
  if (!cached) cached = new Anthropic();
  return cached;
}
