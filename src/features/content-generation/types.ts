import type { BrandId, BrandLocale } from "@/features/brands/types";

export type AiProvider = "openai" | "gemini";

export type SocialChannel = "instagram" | "linkedin" | "x" | "tiktok";

export type GenerationRequest = {
  brandId: BrandId;
  provider: AiProvider;
  locale: BrandLocale;
  channel: SocialChannel;
  prompt: string;
};
