import { hasSupabasePublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { AppRole, OutputLanguage } from "@/lib/supabase/types";

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
