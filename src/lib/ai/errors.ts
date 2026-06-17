import "server-only";

import type { AIProviderName } from "@/lib/ai/types";

export type AIProviderErrorCode =
  | "invalid_provider"
  | "provider_auth_failed"
  | "provider_quota_exceeded"
  | "provider_rate_limited"
  | "provider_model_unavailable"
  | "provider_unavailable"
  | "provider_bad_response"
  | "unknown_provider_error";

const providerLabels: Record<AIProviderName, string> = {
  gemini: "Gemini",
  openai: "OpenAI",
};

function providerLabel(provider: AIProviderName | null): string {
  return provider ? providerLabels[provider] : "Provider";
}

function safeMessageForCode(
  code: AIProviderErrorCode,
  provider: AIProviderName | null,
): string {
  const label = providerLabel(provider);

  if (code === "invalid_provider") {
    return "Unsupported AI provider.";
  }

  if (code === "provider_auth_failed") {
    return `Invalid ${label} provider key.`;
  }

  if (code === "provider_quota_exceeded") {
    return `${label} account has no available API credits or quota.`;
  }

  if (code === "provider_rate_limited") {
    return `${label} rate limit reached. Please try again later.`;
  }

  if (code === "provider_model_unavailable") {
    return `Selected model is not available for this ${label} provider key.`;
  }

  if (code === "provider_unavailable") {
    return `${label} is currently unavailable.`;
  }

  return "Unable to generate content right now.";
}

export class AIProviderError extends Error {
  readonly code: AIProviderErrorCode;
  readonly provider: AIProviderName | null;

  constructor(code: AIProviderErrorCode, provider: AIProviderName | null = null) {
    super(safeMessageForCode(code, provider));
    this.code = code;
    this.provider = provider;
    this.name = "AIProviderError";
  }
}

export function mapHttpStatusToProviderError({
  provider = null,
  status,
}: {
  provider?: AIProviderName | null;
  status: number;
}): AIProviderError {
  if (status === 401 || status === 403) {
    return new AIProviderError("provider_auth_failed", provider);
  }

  if (status === 429) {
    return new AIProviderError("provider_rate_limited", provider);
  }

  if (status >= 500) {
    return new AIProviderError("provider_unavailable", provider);
  }

  return new AIProviderError("unknown_provider_error", provider);
}

function readProviderErrorText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(readProviderErrorText).join(" ");
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map(readProviderErrorText)
      .join(" ");
  }

  return "";
}

function mapProviderErrorText({
  provider,
  status,
  text,
}: {
  provider: AIProviderName;
  status: number;
  text: string;
}): AIProviderError | null {
  const normalized = text.toLowerCase();

  if (
    normalized.includes("insufficient_quota") ||
    normalized.includes("quota") ||
    normalized.includes("credits") ||
    normalized.includes("billing") ||
    normalized.includes("resource_exhausted")
  ) {
    return new AIProviderError("provider_quota_exceeded", provider);
  }

  if (
    normalized.includes("model_not_found") ||
    normalized.includes("model_not_available") ||
    normalized.includes("model is not found") ||
    normalized.includes("model not found") ||
    normalized.includes("not found for api version") ||
    normalized.includes("not supported for generatecontent")
  ) {
    return new AIProviderError("provider_model_unavailable", provider);
  }

  if (
    normalized.includes("invalid api key") ||
    normalized.includes("api_key_invalid") ||
    normalized.includes("invalid authentication") ||
    normalized.includes("incorrect api key")
  ) {
    return new AIProviderError("provider_auth_failed", provider);
  }

  if (normalized.includes("rate_limit") || normalized.includes("rate limit")) {
    return new AIProviderError("provider_rate_limited", provider);
  }

  if (status === 400 || status === 404) {
    return new AIProviderError("provider_model_unavailable", provider);
  }

  return null;
}

export async function mapProviderResponseToError(
  response: Response,
  provider: AIProviderName,
): Promise<AIProviderError> {
  try {
    const contentType = response.headers.get("content-type") ?? "";
    const errorPayload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
    const mapped = mapProviderErrorText({
      provider,
      status: response.status,
      text: readProviderErrorText(errorPayload),
    });

    if (mapped) {
      return mapped;
    }
  } catch {
    // Ignore provider parsing failures and fall back to safe status mapping.
  }

  return mapHttpStatusToProviderError({ provider, status: response.status });
}
