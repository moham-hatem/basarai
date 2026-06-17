import "server-only";

import type { AiProvider } from "@/lib/supabase/types";

export type AIProviderName = AiProvider;

export type GenerateTextInput = {
  apiKey: string;
  maxOutputTokens?: number;
  model?: string;
  prompt: string;
  temperature?: number;
};

export type GenerateTextUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

export type GenerateTextResult = {
  model: string;
  provider: AIProviderName;
  text: string;
  usage: GenerateTextUsage;
};

export type AIProviderAdapter = {
  generateText(input: GenerateTextInput): Promise<GenerateTextResult>;
  name: AIProviderName;
};
