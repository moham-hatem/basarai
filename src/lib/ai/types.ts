import "server-only";

import type {
  AiProvider,
  Json,
  OutputLanguage,
  SocialPlatform,
} from "@/lib/supabase/types";

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

export type PromptBrandContext = {
  default_language: OutputLanguage;
  industry: string | null;
  name: string;
  website_url: string | null;
};

export type PromptBrandKitContext = {
  audience: string | null;
  banned_terms: string | null;
  guidelines: Json;
  name: string;
  value_props: string | null;
  voice: string | null;
};

export type ContentGenerationInput = {
  goal: string;
  language: OutputLanguage;
  numberOfVariants: number;
  platform: SocialPlatform;
  toneOverride?: string | null;
  topic: string;
};

export type BuildPromptInput = {
  brand: PromptBrandContext;
  brandKit: PromptBrandKitContext;
  generation: ContentGenerationInput;
};

export type GeneratedContentVariant = {
  caption: string;
  cta: string;
  hashtags: string[];
  hook: string;
  image_prompt: string;
  notes: string;
};

export type GeneratedContentResult = {
  variants: GeneratedContentVariant[];
};
