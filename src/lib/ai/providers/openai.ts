import "server-only";

export type ProviderValidationResult = "failed" | "invalid" | "valid";

const OPENAI_MODELS_URL = "https://api.openai.com/v1/models";

export async function validateOpenAiKey(
  apiKey: string,
): Promise<ProviderValidationResult> {
  try {
    const response = await fetch(OPENAI_MODELS_URL, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (response.ok) {
      return "valid";
    }

    if (response.status === 401 || response.status === 403) {
      return "invalid";
    }

    return "failed";
  } catch {
    return "failed";
  }
}
