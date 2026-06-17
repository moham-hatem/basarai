import "server-only";

import type { ProviderValidationResult } from "@/lib/ai/providers/openai";

const GEMINI_MODELS_URL = "https://generativelanguage.googleapis.com/v1beta/models";

export async function validateGeminiKey(
  apiKey: string,
): Promise<ProviderValidationResult> {
  try {
    const url = new URL(GEMINI_MODELS_URL);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
    });

    if (response.ok) {
      return "valid";
    }

    if (response.status === 400 || response.status === 401 || response.status === 403) {
      return "invalid";
    }

    return "failed";
  } catch {
    return "failed";
  }
}
