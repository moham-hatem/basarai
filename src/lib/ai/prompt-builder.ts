import "server-only";

import type { Json, OutputLanguage, SocialPlatform } from "@/lib/supabase/types";
import type {
  BuildPromptInput,
  GeneratedContentResult,
  GeneratedContentVariant,
} from "@/lib/ai/types";

const platformRules: Record<SocialPlatform, string> = {
  facebook:
    "Facebook: write conversational, community-focused copy that encourages discussion and feels approachable.",
  instagram:
    "Instagram: write concise, engaging, visual-friendly copy with relevant hashtags and a strong image direction.",
  linkedin:
    "LinkedIn: write professional, insightful, structured copy with a clear business or expert perspective.",
  x: "X/Twitter: write short, punchy, concise copy with sharp hooks and minimal filler.",
};

const languageRules: Record<OutputLanguage, string> = {
  ar: "Arabic only. Do not include English unless it is a required brand/product name.",
  ar_en:
    "Bilingual Arabic + English. Provide natural Arabic and English in each variant, not a literal word-for-word translation.",
  en: "English only. Do not include Arabic unless it is a required brand/product name.",
};

const emptyVariant: GeneratedContentVariant = {
  caption: "",
  cta: "",
  hashtags: [],
  hook: "",
  image_prompt: "",
  notes: "",
};

function cleanText(value: string | null | undefined, fallback = "Not provided"): string {
  const cleaned = value?.trim();
  return cleaned ? cleaned : fallback;
}

function stringifyGuidelines(value: Json): string {
  if (value === null || value === undefined) {
    return "Not provided";
  }

  if (typeof value === "string") {
    return cleanText(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "Not provided";
  }
}

function clampVariantCount(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(Math.max(Math.trunc(value), 1), 10);
}

function normalizeHashtags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeVariant(value: unknown): GeneratedContentVariant | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;

  return {
    caption:
      typeof record.caption === "string" ? record.caption : emptyVariant.caption,
    cta: typeof record.cta === "string" ? record.cta : emptyVariant.cta,
    hashtags: normalizeHashtags(record.hashtags),
    hook: typeof record.hook === "string" ? record.hook : emptyVariant.hook,
    image_prompt:
      typeof record.image_prompt === "string"
        ? record.image_prompt
        : emptyVariant.image_prompt,
    notes: typeof record.notes === "string" ? record.notes : emptyVariant.notes,
  };
}

function extractJsonText(text: string): string {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

export function buildContentGenerationPrompt(input: BuildPromptInput): string {
  const variantCount = clampVariantCount(input.generation.numberOfVariants);
  const toneInstruction = input.generation.toneOverride
    ? `Tone override: ${input.generation.toneOverride.trim()}`
    : "Tone override: none. Use the Brand Kit voice.";

  return [
    "You are Basarai, a brand-safe social media content generation assistant.",
    "Create platform-specific social media copy that strictly follows the provided Brand Kit.",
    "",
    "Brand context:",
    `- Brand name: ${cleanText(input.brand.name)}`,
    `- Industry: ${cleanText(input.brand.industry)}`,
    `- Website URL: ${cleanText(input.brand.website_url)}`,
    `- Default language: ${input.brand.default_language}`,
    "",
    "Brand Kit:",
    `- Kit name: ${cleanText(input.brandKit.name)}`,
    `- Voice: ${cleanText(input.brandKit.voice)}`,
    `- Audience: ${cleanText(input.brandKit.audience)}`,
    `- Value proposition: ${cleanText(input.brandKit.value_props)}`,
    `- Banned terms: ${cleanText(input.brandKit.banned_terms)}`,
    "- Guidelines:",
    stringifyGuidelines(input.brandKit.guidelines),
    "",
    "Generation input:",
    `- Platform: ${input.generation.platform}`,
    `- Language: ${input.generation.language}`,
    `- Goal: ${cleanText(input.generation.goal)}`,
    `- Topic: ${cleanText(input.generation.topic)}`,
    `- Number of variants: ${variantCount}`,
    `- ${toneInstruction}`,
    "",
    "Platform rules:",
    platformRules[input.generation.platform],
    "",
    "Language rules:",
    languageRules[input.generation.language],
    "",
    "Output rules:",
    "- Respect the Brand Kit, including voice, audience, value proposition, and guidelines.",
    "- Do not include banned terms or close variants of banned terms.",
    `- Generate exactly ${variantCount} variants.`,
    "- Return strict JSON only. Do not include markdown, commentary, or extra text.",
    "- Each hashtag must be a string. Use an empty array when hashtags are not appropriate.",
    "- image_prompt should describe a useful visual direction for a designer or image model.",
    "",
    "Return this exact JSON shape:",
    JSON.stringify(
      {
        variants: [
          {
            hook: "",
            caption: "",
            cta: "",
            hashtags: [],
            image_prompt: "",
            notes: "",
          },
        ],
      },
      null,
      2,
    ),
  ].join("\n");
}

export function parseGeneratedContent(text: string): GeneratedContentResult {
  try {
    const parsed = JSON.parse(extractJsonText(text)) as unknown;

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("Generated content root must be an object.");
    }

    const variants = (parsed as { variants?: unknown }).variants;

    if (!Array.isArray(variants)) {
      throw new Error("Generated content variants must be an array.");
    }

    const normalizedVariants = variants
      .map(normalizeVariant)
      .filter((variant): variant is GeneratedContentVariant => variant !== null);

    if (normalizedVariants.length === 0) {
      throw new Error("Generated content did not include usable variants.");
    }

    return { variants: normalizedVariants };
  } catch {
    return {
      variants: [
        {
          ...emptyVariant,
          caption: text,
          notes: "Model output could not be parsed as strict JSON.",
        },
      ],
    };
  }
}
