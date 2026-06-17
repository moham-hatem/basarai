import "server-only";

import { AIProviderError } from "@/lib/ai/errors";
import { geminiProviderAdapter } from "@/lib/ai/providers/gemini";
import { openAIProviderAdapter } from "@/lib/ai/providers/openai";
import type { AIProviderAdapter, AIProviderName } from "@/lib/ai/types";

export function getAIProviderAdapter(
  provider: AIProviderName,
): AIProviderAdapter {
  if (provider === "openai") {
    return openAIProviderAdapter;
  }

  if (provider === "gemini") {
    return geminiProviderAdapter;
  }

  throw new AIProviderError("invalid_provider");
}
