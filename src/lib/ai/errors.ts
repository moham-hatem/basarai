import "server-only";

export type AIProviderErrorCode =
  | "invalid_provider"
  | "provider_auth_failed"
  | "provider_rate_limited"
  | "provider_unavailable"
  | "provider_bad_response"
  | "unknown_provider_error";

const safeMessages: Record<AIProviderErrorCode, string> = {
  invalid_provider: "Unsupported AI provider.",
  provider_auth_failed: "AI provider authentication failed.",
  provider_rate_limited: "AI provider rate limit reached.",
  provider_unavailable: "AI provider is unavailable.",
  provider_bad_response: "AI provider returned an unexpected response.",
  unknown_provider_error: "Unable to complete AI provider request.",
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
