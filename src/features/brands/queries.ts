import { hasSupabasePublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { AppRole, Json, OutputLanguage } from "@/lib/supabase/types";

export const ACTIVE_BRAND_COOKIE_NAME = "basarai_active_brand_id";

export type UserBrand = {
  id: string;
  name: string;
  slug: string;
};

export type UserBrandDetails = UserBrand & {
  createdAt: string;
  defaultLanguage: OutputLanguage;
  industry: string | null;
  role: AppRole;
  websiteUrl: string | null;
};

export type BrandSettingsDetails = UserBrandDetails;

export type BrandTeamMember = {
  avatarUrl: string | null;
  createdAt: string;
  email: string | null;
  fullName: string | null;
  role: AppRole;
  userId: string;
};

export type BrandKitDetails = {
  audience: string | null;
  bannedWords: string[];
  brandId: string;
  competitors: string[];
  examples: string[];
  id: string;
  name: string;
  personalityTraits: string[];
  preferredHashtags: string[];
  preferredWords: string[];
  primaryColor: string | null;
  productDescription: string | null;
  secondaryColor: string | null;
  toneOfVoice: string | null;
  valueProposition: string | null;
  writingRules: string[];
};

type BrandKitRow = {
  audience: string | null;
  banned_terms: string | null;
  brand_id: string;
  guidelines: Json;
  id: string;
  name: string;
  value_props: string | null;
  voice: string | null;
};

type BrandKitGuidelines = {
  banned_words: string[];
  competitors: string[];
  examples: string[];
  personality_traits: string[];
  preferred_hashtags: string[];
  preferred_words: string[];
  primary_color: string | null;
  product_description: string | null;
  secondary_color: string | null;
  writing_rules: string[];
};

function isJsonObject(value: Json): value is { [key: string]: Json | undefined } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readJsonString(value: Json | undefined): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function readJsonStringArray(value: Json | undefined): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function parseDelimitedText(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBrandKitGuidelines(value: Json): BrandKitGuidelines {
  const guidelines = isJsonObject(value) ? value : {};

  return {
    banned_words: readJsonStringArray(guidelines.banned_words),
    competitors: readJsonStringArray(guidelines.competitors),
    examples: readJsonStringArray(guidelines.examples),
    personality_traits: readJsonStringArray(guidelines.personality_traits),
    preferred_hashtags: readJsonStringArray(guidelines.preferred_hashtags),
    preferred_words: readJsonStringArray(guidelines.preferred_words),
    primary_color: readJsonString(guidelines.primary_color),
    product_description: readJsonString(guidelines.product_description),
    secondary_color: readJsonString(guidelines.secondary_color),
    writing_rules: readJsonStringArray(guidelines.writing_rules),
  };
}

function mapBrandKit(row: BrandKitRow): BrandKitDetails {
  const guidelines = parseBrandKitGuidelines(row.guidelines);

  return {
    audience: row.audience,
    bannedWords:
      guidelines.banned_words.length > 0
        ? guidelines.banned_words
        : parseDelimitedText(row.banned_terms),
    brandId: row.brand_id,
    competitors: guidelines.competitors,
    examples: guidelines.examples,
    id: row.id,
    name: row.name,
    personalityTraits: guidelines.personality_traits,
    preferredHashtags: guidelines.preferred_hashtags,
    preferredWords: guidelines.preferred_words,
    primaryColor: guidelines.primary_color,
    productDescription: guidelines.product_description,
    secondaryColor: guidelines.secondary_color,
    toneOfVoice: row.voice,
    valueProposition: row.value_props,
    writingRules: guidelines.writing_rules,
  };
}

export async function getCurrentUserBrandCount(userId: string): Promise<number> {
  if (!hasSupabasePublicEnv()) {
    return 0;
  }

  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("brand_members")
    .select("brand_id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    return 0;
  }

  return count ?? 0;
}

export async function getUserBrands(userId: string): Promise<UserBrand[]> {
  if (!hasSupabasePublicEnv()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data: memberships, error: membershipError } = await supabase
    .from("brand_members")
    .select("brand_id")
    .eq("user_id", userId);

  if (membershipError || !memberships.length) {
    return [];
  }

  const brandIds = memberships.map((membership) => membership.brand_id);
  const { data: brands, error: brandsError } = await supabase
    .from("brands")
    .select("id, name, slug")
    .in("id", brandIds)
    .order("created_at", { ascending: true });

  if (brandsError) {
    return [];
  }

  return brands;
}

export async function getUserBrandDetails(
  userId: string,
): Promise<UserBrandDetails[]> {
  if (!hasSupabasePublicEnv()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data: memberships, error: membershipError } = await supabase
    .from("brand_members")
    .select("brand_id, role")
    .eq("user_id", userId);

  if (membershipError || !memberships.length) {
    return [];
  }

  const roleByBrandId = new Map(
    memberships.map((membership) => [membership.brand_id, membership.role]),
  );
  const brandIds = memberships.map((membership) => membership.brand_id);
  const { data: brands, error: brandsError } = await supabase
    .from("brands")
    .select("id, name, slug, industry, website_url, default_language, created_at")
    .in("id", brandIds)
    .order("created_at", { ascending: true });

  if (brandsError) {
    return [];
  }

  return brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    createdAt: brand.created_at,
    defaultLanguage: brand.default_language,
    industry: brand.industry,
    role: roleByBrandId.get(brand.id) ?? "viewer",
    websiteUrl: brand.website_url,
  }));
}

export async function getBrandSettingsForUser({
  brandId,
  userId,
}: {
  brandId: string;
  userId: string;
}): Promise<BrandSettingsDetails | null> {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
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
    .select("id, name, slug, industry, website_url, default_language, created_at")
    .eq("id", brandId)
    .maybeSingle();

  if (brandError || !brand) {
    return null;
  }

  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    createdAt: brand.created_at,
    defaultLanguage: brand.default_language,
    industry: brand.industry,
    role: membership.role,
    websiteUrl: brand.website_url,
  };
}

export async function getBrandTeamMembers({
  brandId,
}: {
  brandId: string;
}): Promise<BrandTeamMember[]> {
  if (!hasSupabasePublicEnv()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data: memberships, error: membershipError } = await supabase
    .from("brand_members")
    .select("user_id, role, created_at")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: true });

  if (membershipError || !memberships.length) {
    return [];
  }

  const userIds = memberships.map((membership) => membership.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url")
    .in("id", userIds);

  const profilesById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  return memberships.map((membership) => {
    const profile = profilesById.get(membership.user_id);

    return {
      avatarUrl: profile?.avatar_url ?? null,
      createdAt: membership.created_at,
      email: profile?.email ?? null,
      fullName: profile?.full_name ?? null,
      role: membership.role,
      userId: membership.user_id,
    };
  });
}

export async function getDefaultBrandKitForUser({
  allowCreate,
  brandId,
  userId,
}: {
  allowCreate: boolean;
  brandId: string;
  userId: string;
}): Promise<BrandKitDetails | null> {
  if (!hasSupabasePublicEnv()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const selectedColumns =
    "id, brand_id, name, voice, audience, value_props, banned_terms, guidelines";
  const { data: existingKit, error: selectError } = await supabase
    .from("brand_kits")
    .select(selectedColumns)
    .eq("brand_id", brandId)
    .eq("is_default", true)
    .maybeSingle();

  if (selectError) {
    return null;
  }

  if (existingKit) {
    return mapBrandKit(existingKit);
  }

  if (!allowCreate) {
    return null;
  }

  const { data: createdKit, error: insertError } = await supabase
    .from("brand_kits")
    .insert({
      brand_id: brandId,
      created_by: userId,
      is_default: true,
      name: "Default Brand Kit",
    })
    .select(selectedColumns)
    .single();

  if (insertError || !createdKit) {
    return null;
  }

  return mapBrandKit(createdKit);
}

export async function getFirstUserBrand(
  userId: string,
): Promise<UserBrand | null> {
  const [brand] = await getUserBrands(userId);
  return brand ?? null;
}

export async function getActiveBrandForUser(
  userId: string,
  brands?: UserBrand[],
): Promise<UserBrand | null> {
  const userBrands = brands ?? (await getUserBrands(userId));

  if (userBrands.length === 0) {
    return null;
  }

  const cookieStore = await cookies();
  const activeBrandId = cookieStore.get(ACTIVE_BRAND_COOKIE_NAME)?.value;
  const activeBrand = userBrands.find((brand) => brand.id === activeBrandId);

  return activeBrand ?? userBrands[0] ?? null;
}

export async function userHasBrands(userId: string): Promise<boolean> {
  return (await getFirstUserBrand(userId)) !== null;
}
