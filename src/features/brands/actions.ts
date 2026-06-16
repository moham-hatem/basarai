"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasSupabasePublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ACTIVE_BRAND_COOKIE_NAME } from "@/features/brands/queries";
import {
  createBrandSlug,
  createSlugSuffix,
  type CreateBrandInput,
  type CreateBrandFormState,
  parseCreateBrandForm,
} from "@/features/brands/validation";

function errorState(message: string): CreateBrandFormState {
  return { status: "error", message };
}

function isSafeReturnPath(path: FormDataEntryValue | null): path is string {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//");
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function setActiveBrandCookie(brandId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_BRAND_COOKIE_NAME, brandId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

async function createOwnedBrand({
  input,
  supabase,
  userId,
}: {
  input: CreateBrandInput;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  userId: string;
}): Promise<{ ok: true; brandId: string } | { ok: false; error: string }> {
  const slugCandidates = [
    createBrandSlug(input.name),
    createBrandSlug(input.name, createSlugSuffix()),
    createBrandSlug(input.name, createSlugSuffix()),
  ];

  let brandId: string | null = null;

  for (const slug of slugCandidates) {
    const { data, error } = await supabase
      .from("brands")
      .insert({
        name: input.name,
        slug,
        industry: input.industry,
        website_url: input.websiteUrl,
        default_language: input.defaultLanguage,
        created_by: userId,
      })
      .select("id")
      .single();

    if (!error && data) {
      brandId = data.id;
      break;
    }

    if (error && error.code !== "23505") {
      return { ok: false, error: "Unable to create brand. Please try again." };
    }
  }

  if (!brandId) {
    return {
      ok: false,
      error: "Unable to create a unique brand slug. Please try again.",
    };
  }

  const memberResult = await supabase.from("brand_members").insert({
    brand_id: brandId,
    user_id: userId,
    role: "owner",
  });

  if (memberResult.error) {
    return {
      ok: false,
      error: "Brand was created, but owner access could not be added.",
    };
  }

  const kitResult = await supabase.from("brand_kits").insert({
    brand_id: brandId,
    name: "Default Brand Kit",
    is_default: true,
    created_by: userId,
  });

  if (kitResult.error) {
    return {
      ok: false,
      error: "Brand was created, but the default brand kit could not be added.",
    };
  }

  return { ok: true, brandId };
}

export async function setActiveBrandAction(formData: FormData): Promise<void> {
  const brandId = formData.get("brandId");
  const returnTo = formData.get("returnTo");
  const redirectPath = isSafeReturnPath(returnTo) ? returnTo : "/dashboard";

  if (typeof brandId !== "string" || !isUuid(brandId)) {
    redirect(redirectPath);
  }

  if (!hasSupabasePublicEnv()) {
    redirect(redirectPath);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership, error } = await supabase
    .from("brand_members")
    .select("brand_id")
    .eq("user_id", user.id)
    .eq("brand_id", brandId)
    .maybeSingle();

  if (error || !membership) {
    redirect(redirectPath);
  }

  await setActiveBrandCookie(brandId);

  redirect(redirectPath);
}

export async function createAdditionalBrandAction(
  _previousState: CreateBrandFormState,
  formData: FormData,
): Promise<CreateBrandFormState> {
  const parsed = parseCreateBrandForm(formData);

  if (!parsed.data) {
    return errorState(parsed.error);
  }

  if (!hasSupabasePublicEnv()) {
    return errorState("Supabase is not configured for this environment.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const created = await createOwnedBrand({
    input: parsed.data,
    supabase,
    userId: user.id,
  });

  if (!created.ok) {
    return errorState(created.error);
  }

  await setActiveBrandCookie(created.brandId);

  redirect("/brands");
}

export async function createFirstBrandAction(
  _previousState: CreateBrandFormState,
  formData: FormData,
): Promise<CreateBrandFormState> {
  const parsed = parseCreateBrandForm(formData);

  if (!parsed.data) {
    return errorState(parsed.error);
  }

  if (!hasSupabasePublicEnv()) {
    return errorState("Supabase is not configured for this environment.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const existingMembership = await supabase
    .from("brand_members")
    .select("brand_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existingMembership.data) {
    redirect("/dashboard");
  }

  if (existingMembership.error) {
    return errorState("Unable to check brand access. Please try again.");
  }

  const created = await createOwnedBrand({
    input: parsed.data,
    supabase,
    userId: user.id,
  });

  if (!created.ok) {
    return errorState(created.error);
  }

  await setActiveBrandCookie(created.brandId);

  redirect("/dashboard");
}
