import "server-only";

import { hasSupabasePublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AiProvider,
  GenerationStatus,
  Json,
  OutputLanguage,
  SocialPlatform,
} from "@/lib/supabase/types";
import type {
  GeneratedContentResult,
  GeneratedContentVariant,
} from "@/lib/ai/types";

export type HistoryStatusFilter = "all" | "completed" | "failed";
export type HistoryPlatformFilter = "all" | SocialPlatform;
export type HistoryProviderFilter = "all" | AiProvider;

export type GenerationHistoryFilters = {
  platform: HistoryPlatformFilter;
  provider: HistoryProviderFilter;
  status: HistoryStatusFilter;
};

export type GenerationHistoryItem = {
  createdAt: string;
  errorMessage: string | null;
  id: string;
  language: OutputLanguage;
  latencyMs: number | null;
  model: string;
  output: GeneratedContentResult | null;
  platform: SocialPlatform;
  provider: AiProvider;
  status: GenerationStatus;
  tokensTotal: number;
  topic: string;
};

const emptyFilters: GenerationHistoryFilters = {
  platform: "all",
  provider: "all",
  status: "all",
};

const platforms = new Set<SocialPlatform>([
  "facebook",
  "instagram",
  "linkedin",
  "x",
]);
const providers = new Set<AiProvider>(["gemini", "openai"]);
const statuses = new Set<HistoryStatusFilter>(["all", "completed", "failed"]);

function isJsonObject(value: Json): value is { [key: string]: Json | undefined } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: Json | undefined): string {
  return typeof value === "string" ? value : "";
}

function readStringArray(value: Json | undefined): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function parseVariant(value: Json): GeneratedContentVariant | null {
  if (!isJsonObject(value)) {
    return null;
  }

  return {
    caption: readString(value.caption),
    cta: readString(value.cta),
    hashtags: readStringArray(value.hashtags),
    hook: readString(value.hook),
    image_prompt: readString(value.image_prompt),
    notes: readString(value.notes),
  };
}

function parseHistoryOutput(value: Json): GeneratedContentResult | null {
  if (!isJsonObject(value) || !Array.isArray(value.variants)) {
    return null;
  }

  const variants = value.variants
    .map((variant) => parseVariant(variant))
    .filter((variant): variant is GeneratedContentVariant => variant !== null);

  return variants.length > 0 ? { variants } : null;
}

function readTopic(rowTopic: string | null, inputPayload: Json): string {
  if (rowTopic?.trim()) {
    return rowTopic;
  }

  if (isJsonObject(inputPayload)) {
    const topic = readString(inputPayload.topic).trim();

    if (topic) {
      return topic;
    }
  }

  return "Untitled generation";
}

export function parseGenerationHistoryFilters(searchParams: {
  platform?: string | string[];
  provider?: string | string[];
  status?: string | string[];
}): GenerationHistoryFilters {
  const status = Array.isArray(searchParams.status)
    ? searchParams.status[0]
    : searchParams.status;
  const platform = Array.isArray(searchParams.platform)
    ? searchParams.platform[0]
    : searchParams.platform;
  const provider = Array.isArray(searchParams.provider)
    ? searchParams.provider[0]
    : searchParams.provider;

  return {
    platform: platforms.has(platform as SocialPlatform)
      ? (platform as SocialPlatform)
      : emptyFilters.platform,
    provider: providers.has(provider as AiProvider)
      ? (provider as AiProvider)
      : emptyFilters.provider,
    status: statuses.has(status as HistoryStatusFilter)
      ? (status as HistoryStatusFilter)
      : emptyFilters.status,
  };
}

export async function getGenerationHistoryForBrand({
  brandId,
  filters,
  userId,
}: {
  brandId: string;
  filters: GenerationHistoryFilters;
  userId: string;
}): Promise<GenerationHistoryItem[]> {
  if (!hasSupabasePublicEnv()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data: membership, error: membershipError } = await supabase
    .from("brand_members")
    .select("role")
    .eq("brand_id", brandId)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError || !membership) {
    return [];
  }

  let query = supabase
    .from("generation_history")
    .select(
      "id, topic, input_payload, platform, provider, language, status, created_at, error_message, output, tokens, tokens_total, latency_ms, model",
    )
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false });

  if (filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.platform !== "all") {
    query = query.eq("platform", filters.platform);
  }

  if (filters.provider !== "all") {
    query = query.eq("provider", filters.provider);
  }

  const { data, error } = await query;

  if (error) {
    return [];
  }

  return data.map((row) => ({
    createdAt: row.created_at,
    errorMessage: row.error_message,
    id: row.id,
    language: row.language,
    latencyMs: row.latency_ms,
    model: row.model,
    output: row.status === "completed" ? parseHistoryOutput(row.output) : null,
    platform: row.platform,
    provider: row.provider,
    status: row.status,
    tokensTotal: row.tokens_total || row.tokens || 0,
    topic: readTopic(row.topic, row.input_payload),
  }));
}
