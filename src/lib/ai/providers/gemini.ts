import "server-only";

import {
  AIProviderError,
  mapProviderResponseToError,
} from "@/lib/ai/errors";
import type { ProviderValidationResult } from "@/lib/ai/providers/openai";
import type {
  AIProviderAdapter,
  GenerateTextInput,
  GenerateTextResult,
} from "@/lib/ai/types";

const GEMINI_MODELS_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
export const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: unknown;
      }>;
    };
  }>;
  usageMetadata?: {
    candidatesTokenCount?: unknown;
    promptTokenCount?: unknown;
    totalTokenCount?: unknown;
  };
};

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

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function extractGeminiText(body: GeminiGenerateContentResponse): string {
  const text = (body.candidates ?? [])
    .flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim();

  if (!text) {
    throw new AIProviderError("provider_bad_response");
  }

  return text;
}

async function generateGeminiText(
  input: GenerateTextInput,
): Promise<GenerateTextResult> {
  const model = input.model?.trim() || DEFAULT_GEMINI_MODEL;
  const url = new URL(
    `${GEMINI_API_BASE_URL}/models/${encodeURIComponent(model)}:generateContent`,
  );
  url.searchParams.set("key", input.apiKey);

  try {
    const response = await fetch(url, {
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: input.prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: input.maxOutputTokens,
          temperature: input.temperature,
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      throw await mapProviderResponseToError(response, "gemini");
    }

    const body = (await response.json()) as GeminiGenerateContentResponse;

    return {
      model,
      provider: "gemini",
      text: extractGeminiText(body),
      usage: {
        inputTokens: readNumber(body.usageMetadata?.promptTokenCount),
        outputTokens: readNumber(body.usageMetadata?.candidatesTokenCount),
        totalTokens: readNumber(body.usageMetadata?.totalTokenCount),
      },
    };
  } catch (error) {
    if (error instanceof AIProviderError) {
      throw error;
    }

    throw new AIProviderError("provider_unavailable");
  }
}

export const geminiProviderAdapter: AIProviderAdapter = {
  generateText: generateGeminiText,
  name: "gemini",
};
