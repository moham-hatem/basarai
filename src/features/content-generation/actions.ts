"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AIProviderError } from "@/lib/ai/errors";
import { buildContentGenerationPrompt, parseGeneratedContent } from "@/lib/ai/prompt-builder";
import { getAIProviderAdapter } from "@/lib/ai/provider-registry";
import { hasSupabasePublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AppRole,
  GenerationStatus,
  Json,
  OutputLanguage,
} from "@/lib/supabase/types";
import { getActiveBrandForUser } from "@/features/brands/queries";
import {
  initialContentGenerationFormState,
  parseContentGenerationForm,
  type ContentGenerationFormInput,
  type ContentGenerationFormState,
} from "@/features/content-generation/validation";

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

type ActiveBrandContext = {
  brand: {
    default_language: OutputLanguage;
    id: string;
    industry: string | null;
    name: string;
    website_url: string | null;
  };
  brandKit: {
    audience: string | null;
    banned_terms: string | null;
    guidelines: Json;
    id: string;
    name: string;
    value_props: string | null;
    voice: string | null;
  };
  role: AppRole;
};

type HistoryContext = {
  brandId: string;
  brandKitId: string;
  input: ContentGenerationFormInput;
  prompt: string;
  supabase: SupabaseServerClient;
  userId: string;
};

function errorState(message: string): ContentGenerationFormState {
  return { ...initialContentGenerationFormState, message, status: "error" };
}

function successState({
  message,
  result,
}: Pick<ContentGenerationFormState, "message" | "result">): ContentGenerationFormState {
  return { message, result, status: "success" };
}

function canGenerate(role: AppRole): boolean {
  return role === "owner" || role === "admin" || role === "editor";
}

function safeGenerationErrorMessage(error: unknown): string {
  if (error instanceof AIProviderError) {
    return error.message;
  }

  if (error instanceof Error && error.message === "Please add a provider key first.") {
    return error.message;
  }

  return "Unable to generate content right now.";
}

function missingProviderKeyError(): Error {
  return new Error("Please add a provider key first.");
}

function tokensOrZero(value: number | undefined): number {
  return value ?? 0;
}

function createInputPayload(input: ContentGenerationFormInput): Json {
  return {
    goal: input.goal,
    language: input.language,
    numberOfVariants: input.numberOfVariants,
    platform: input.platform,
    provider: input.provider,
    toneOverride: input.toneOverride,
    topic: input.topic,
  };
}

async function loadActiveBrandContext({
  brandId,
  supabase,
  userId,
}: {
  brandId: string;
  supabase: SupabaseServerClient;
  userId: string;
}): Promise<ActiveBrandContext | null> {
  const { data: membership, error: membershipError } = await supabase
    .from("brand_members")
    .select("role")
    .eq("brand_id", brandId)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError || !membership) {
    return null;
  }

  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .select("id, name, industry, website_url, default_language")
    .eq("id", brandId)
    .maybeSingle();

  if (brandError || !brand) {
    return null;
  }

  const { data: brandKit, error: brandKitError } = await supabase
    .from("brand_kits")
    .select("id, name, voice, audience, value_props, banned_terms, guidelines")
    .eq("brand_id", brandId)
    .eq("is_default", true)
    .maybeSingle();

  if (brandKitError || !brandKit) {
    return null;
  }

  return {
    brand,
    brandKit,
    role: membership.role,
  };
}

async function insertGenerationHistory({
  brandId,
  brandKitId,
  completedAt,
  errorMessage,
  input,
  latencyMs,
  model,
  output,
  prompt,
  provider,
  status,
  supabase,
  tokensInput,
  tokensOutput,
  tokensTotal,
  userId,
}: HistoryContext & {
  completedAt: string | null;
  errorMessage: string | null;
  latencyMs: number | null;
  model: string;
  output: Json;
  provider: ContentGenerationFormInput["provider"];
  status: GenerationStatus;
  tokensInput: number;
  tokensOutput: number;
  tokensTotal: number;
}): Promise<void> {
  await supabase.from("generation_history").insert({
    brand_id: brandId,
    brand_kit_id: brandKitId,
    completed_at: completedAt,
    error_message: errorMessage,
    goal: input.goal,
    input_payload: createInputPayload(input),
    language: input.language,
    latency_ms: latencyMs,
    model,
    output,
    platform: input.platform,
    prompt_snapshot: { prompt },
    provider,
    status,
    tokens: tokensTotal,
    tokens_input: tokensInput,
    tokens_output: tokensOutput,
    tokens_total: tokensTotal,
    topic: input.topic,
    user_id: userId,
  });
}

export async function generateContentAction(
  _previousState: ContentGenerationFormState,
  formData: FormData,
): Promise<ContentGenerationFormState> {
  const parsed = parseContentGenerationForm(formData);

  if (!parsed.data) {
    return errorState(parsed.error);
  }

  if (!hasSupabasePublicEnv()) {
    return errorState("Supabase is not configured for this environment.");
  }

  const startedAt = Date.now();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const activeBrand = await getActiveBrandForUser(user.id);

  if (!activeBrand) {
    redirect("/onboarding/brand");
  }

  const context = await loadActiveBrandContext({
    brandId: activeBrand.id,
    supabase,
    userId: user.id,
  });

  if (!context) {
    return errorState("Unable to load the active brand context.");
  }

  if (!canGenerate(context.role)) {
    return errorState("You do not have permission to generate content.");
  }

  const prompt = buildContentGenerationPrompt({
    brand: context.brand,
    brandKit: context.brandKit,
    generation: {
      goal: parsed.data.goal,
      language: parsed.data.language,
      numberOfVariants: parsed.data.numberOfVariants,
      platform: parsed.data.platform,
      toneOverride: parsed.data.toneOverride,
      topic: parsed.data.topic,
    },
  });
  const historyContext: HistoryContext = {
    brandId: context.brand.id,
    brandKitId: context.brandKit.id,
    input: parsed.data,
    prompt,
    supabase,
    userId: user.id,
  };

  try {
    const { data: providerSecret, error: secretError } = await supabase.rpc(
      "get_generation_provider_key_secret",
      {
        target_brand_id: context.brand.id,
        target_provider: parsed.data.provider,
      },
    );

    if (secretError || !providerSecret) {
      throw missingProviderKeyError();
    }

    const adapter = getAIProviderAdapter(parsed.data.provider);
    const generated = await adapter.generateText({
      apiKey: providerSecret,
      maxOutputTokens: Math.max(900, parsed.data.numberOfVariants * 450),
      prompt,
      temperature: 0.7,
    });
    const result = parseGeneratedContent(generated.text);
    const latencyMs = Date.now() - startedAt;
    const totalTokens = tokensOrZero(generated.usage.totalTokens);

    await insertGenerationHistory({
      ...historyContext,
      completedAt: new Date().toISOString(),
      errorMessage: null,
      latencyMs,
      model: generated.model,
      output: result as Json,
      provider: generated.provider,
      status: "completed",
      tokensInput: tokensOrZero(generated.usage.inputTokens),
      tokensOutput: tokensOrZero(generated.usage.outputTokens),
      tokensTotal: totalTokens,
    });

    revalidatePath("/generator");

    return successState({
      message: "Content generated.",
      result,
    });
  } catch (error) {
    const message = safeGenerationErrorMessage(error);

    await insertGenerationHistory({
      ...historyContext,
      completedAt: null,
      errorMessage: message,
      latencyMs: Date.now() - startedAt,
      model: "",
      output: { variants: [] },
      provider: parsed.data.provider,
      status: "failed",
      tokensInput: 0,
      tokensOutput: 0,
      tokensTotal: 0,
    });

    return errorState(message);
  }
}
