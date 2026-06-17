import "server-only";

import {
  AIProviderError,
  mapProviderResponseToError,
} from "@/lib/ai/errors";
import type {
  AIProviderAdapter,
  GenerateTextInput,
  GenerateTextResult,
} from "@/lib/ai/types";

export type ProviderValidationResult = "failed" | "invalid" | "valid";

const OPENAI_MODELS_URL = "https://api.openai.com/v1/models";
const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
export const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

type OpenAIResponseContent = {
  text?: unknown;
  type?: unknown;
};

type OpenAIResponseOutput = {
  content?: unknown;
  type?: unknown;
};

type OpenAIResponseBody = {
  output?: unknown;
  output_text?: unknown;
  usage?: {
    input_tokens?: unknown;
    output_tokens?: unknown;
    total_tokens?: unknown;
  };
};

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

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function extractOpenAIText(body: OpenAIResponseBody): string {
  if (typeof body.output_text === "string" && body.output_text.trim()) {
    return body.output_text;
  }

  if (!Array.isArray(body.output)) {
    throw new AIProviderError("provider_bad_response");
  }

  const textParts = body.output.flatMap((item: OpenAIResponseOutput) => {
    if (!Array.isArray(item.content)) {
      return [];
    }

    return item.content
      .map((content: OpenAIResponseContent) =>
        content.type === "output_text" && typeof content.text === "string"
          ? content.text
          : "",
      )
      .filter(Boolean);
  });

  const text = textParts.join("\n").trim();

  if (!text) {
    throw new AIProviderError("provider_bad_response");
  }

  return text;
}

async function generateOpenAIText(
  input: GenerateTextInput,
): Promise<GenerateTextResult> {
  const model = input.model?.trim() || DEFAULT_OPENAI_MODEL;

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      body: JSON.stringify({
        input: input.prompt,
        max_output_tokens: input.maxOutputTokens,
        model,
        temperature: input.temperature,
      }),
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      throw await mapProviderResponseToError(response);
    }

    const body = (await response.json()) as OpenAIResponseBody;

    return {
      model,
      provider: "openai",
      text: extractOpenAIText(body),
      usage: {
        inputTokens: readNumber(body.usage?.input_tokens),
        outputTokens: readNumber(body.usage?.output_tokens),
        totalTokens: readNumber(body.usage?.total_tokens),
      },
    };
  } catch (error) {
    if (error instanceof AIProviderError) {
      throw error;
    }

    throw new AIProviderError("provider_unavailable");
  }
}

export const openAIProviderAdapter: AIProviderAdapter = {
  generateText: generateOpenAIText,
  name: "openai",
};
