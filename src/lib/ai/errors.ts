import "server-only";

export type AIProviderErrorCode =
  | "invalid_provider"
  | "provider_auth_failed"
  | "provider_quota_exceeded"
  | "provider_rate_limited"
  | "provider_model_unavailable"
  | "provider_unavailable"
  | "provider_bad_response"
  | "unknown_provider_error";

const safeMessages: Record<AIProviderErrorCode, string> = {
  invalid_provider: "Unsupported AI provider.",
  provider_auth_failed: "Invalid provider key.",
  provider_quota_exceeded: "Your provider account has no available API credits.",
  provider_rate_limited: "Provider rate limit reached. Please try again later.",
  provider_model_unavailable: "Selected model is not available for this provider key.",
  provider_unavailable: "Provider is currently unavailable.",
  provider_bad_response: "Unable to generate content right now.",
  unknown_provider_error: "Unable to generate content right now.",
};

export class AIProviderError extends Error {
  readonly code: AIProviderErrorCode;

  constructor(code: AIProviderErrorCode) {
    super(safeMessages[code]);
    this.code = code;
    this.name = "AIProviderError";
  }
}

export function mapHttpStatusToProviderError(status: number): AIProviderError {
  if (status === 401 || status === 403) {
    return new AIProviderError("provider_auth_failed");
  }

  if (status === 429) {
    return new AIProviderError("provider_rate_limited");
  }

  if (status >= 500) {
    return new AIProviderError("provider_unavailable");
  }

  return new AIProviderError("unknown_provider_error");
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
  status,
  text,
}: {
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
    return new AIProviderError("provider_quota_exceeded");
  }

  if (
    normalized.includes("model_not_found") ||
    normalized.includes("model_not_available") ||
    normalized.includes("model is not found") ||
    normalized.includes("model not found") ||
    normalized.includes("not found for api version") ||
    normalized.includes("not supported for generatecontent")
  ) {
    return new AIProviderError("provider_model_unavailable");
  }

  if (
    normalized.includes("invalid api key") ||
    normalized.includes("api_key_invalid") ||
    normalized.includes("invalid authentication") ||
    normalized.includes("incorrect api key")
  ) {
    return new AIProviderError("provider_auth_failed");
  }

  if (normalized.includes("rate_limit") || normalized.includes("rate limit")) {
    return new AIProviderError("provider_rate_limited");
  }

  if (status === 400 || status === 404) {
    return new AIProviderError("provider_model_unavailable");
  }

  return null;
}

export async function mapProviderResponseToError(
  response: Response,
): Promise<AIProviderError> {
  try {
    const contentType = response.headers.get("content-type") ?? "";
    const errorPayload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
    const mapped = mapProviderErrorText({
      status: response.status,
      text: readProviderErrorText(errorPayload),
    });

    if (mapped) {
      return mapped;
    }
  } catch {
    // Ignore provider parsing failures and fall back to safe status mapping.
  }

  return mapHttpStatusToProviderError(response.status);
}
