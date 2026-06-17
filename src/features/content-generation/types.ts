import type {
  AiProvider,
  OutputLanguage,
  SocialPlatform,
} from "@/lib/supabase/types";
import type { BrandId } from "@/features/brands/types";

export type GenerationProvider = AiProvider | "demo";

export type GenerationGoal =
  | "announcement"
  | "awareness"
  | "education"
  | "engagement"
  | "launch"
  | "sales";

export type GenerationRequest = {
  brandId: BrandId;
  provider: GenerationProvider;
  goal: GenerationGoal;
  language: OutputLanguage;
  numberOfVariants: number;
  platform: SocialPlatform;
  toneOverride?: string | null;
  topic: string;
};
