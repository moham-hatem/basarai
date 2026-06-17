import type {
  AiProvider,
  OutputLanguage,
  SocialPlatform,
} from "@/lib/supabase/types";
import type { GeneratedContentResult } from "@/lib/ai/types";

export type GenerationGoal =
  | "announcement"
  | "awareness"
  | "education"
  | "engagement"
  | "launch"
  | "sales";

export type ContentGenerationFormInput = {
  goal: GenerationGoal;
  language: OutputLanguage;
  numberOfVariants: number;
  platform: SocialPlatform;
  provider: AiProvider;
  toneOverride: string | null;
  topic: string;
};

export type ContentGenerationFormState = {
  message: string;
  result: GeneratedContentResult | null;
  status: "idle" | "error" | "success";
};

export const initialContentGenerationFormState: ContentGenerationFormState = {
  message: "",
  result: null,
  status: "idle",
};

export const generationGoals: { label: string; value: GenerationGoal }[] = [
  { label: "Awareness", value: "awareness" },
  { label: "Engagement", value: "engagement" },
  { label: "Launch", value: "launch" },
  { label: "Sales", value: "sales" },
  { label: "Education", value: "education" },
  { label: "Announcement", value: "announcement" },
];

export const generationLanguages: { label: string; value: OutputLanguage }[] = [
  { label: "Arabic", value: "ar" },
  { label: "English", value: "en" },
  { label: "Arabic + English", value: "ar_en" },
];

export const generationPlatforms: { label: string; value: SocialPlatform }[] = [
  { label: "LinkedIn", value: "linkedin" },
  { label: "Instagram", value: "instagram" },
  { label: "Facebook", value: "facebook" },
  { label: "X/Twitter", value: "x" },
];

export const generationProviders: { label: string; value: AiProvider }[] = [
  { label: "OpenAI", value: "openai" },
  { label: "Gemini", value: "gemini" },
];

const goalValues = new Set<GenerationGoal>(
  generationGoals.map((goal) => goal.value),
);
const languageValues = new Set<OutputLanguage>(
  generationLanguages.map((language) => language.value),
);
const platformValues = new Set<SocialPlatform>(
  generationPlatforms.map((platform) => platform.value),
);
const providerValues = new Set<AiProvider>(
  generationProviders.map((provider) => provider.value),
);

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function readNumberOfVariants(formData: FormData): number | null {
  const value = readString(formData, "numberOfVariants");
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    return null;
  }

  return parsed;
}

export function parseContentGenerationForm(
  formData: FormData,
): { data: ContentGenerationFormInput; error?: never } | { data?: never; error: string } {
  const provider = readString(formData, "provider") as AiProvider;
  const platform = readString(formData, "platform") as SocialPlatform;
  const language = readString(formData, "language") as OutputLanguage;
  const goal = readString(formData, "goal") as GenerationGoal;
  const topic = readString(formData, "topic");
  const toneOverride = readString(formData, "toneOverride");
  const numberOfVariants = readNumberOfVariants(formData);

  if (!providerValues.has(provider)) {
    return { error: "Select a supported AI provider." };
  }

  if (!platformValues.has(platform)) {
    return { error: "Select a supported social platform." };
  }

  if (!languageValues.has(language)) {
    return { error: "Select a supported output language." };
  }

  if (!goalValues.has(goal)) {
    return { error: "Select a content goal." };
  }

  if (!topic) {
    return { error: "Describe the topic you want to generate content for." };
  }

  if (topic.length > 2000) {
    return { error: "Topic must be 2,000 characters or fewer." };
  }

  if (toneOverride.length > 160) {
    return { error: "Tone override must be 160 characters or fewer." };
  }

  if (numberOfVariants === null) {
    return { error: "Choose between 1 and 5 variants." };
  }

  return {
    data: {
      goal,
      language,
      numberOfVariants,
      platform,
      provider,
      toneOverride: toneOverride || null,
      topic,
    },
  };
}
