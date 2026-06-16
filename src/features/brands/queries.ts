import { hasSupabasePublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UserBrand = {
  id: string;
  name: string;
  slug: string;
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

export async function getFirstUserBrand(
  userId: string,
): Promise<UserBrand | null> {
  const [brand] = await getUserBrands(userId);
  return brand ?? null;
}

export async function userHasBrands(userId: string): Promise<boolean> {
  return (await getFirstUserBrand(userId)) !== null;
}
