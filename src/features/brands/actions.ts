"use server";

import { redirect } from "next/navigation";
import { hasSupabasePublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createBrandSlug,
  createSlugSuffix,
  type CreateBrandFormState,
  parseCreateBrandForm,
} from "@/features/brands/validation";

function errorState(message: string): CreateBrandFormState {
  return { status: "error", message };
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

  const input = parsed.data;
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
        created_by: user.id,
      })
      .select("id")
      .single();

    if (!error && data) {
      brandId = data.id;
      break;
    }

    if (error && error.code !== "23505") {
      return errorState("Unable to create brand. Please try again.");
    }
  }

  if (!brandId) {
    return errorState("Unable to create a unique brand slug. Please try again.");
  }

  const memberResult = await supabase.from("brand_members").insert({
    brand_id: brandId,
    user_id: user.id,
    role: "owner",
  });

  if (memberResult.error) {
    return errorState("Brand was created, but owner access could not be added.");
  }

  const kitResult = await supabase.from("brand_kits").insert({
    brand_id: brandId,
    name: "Default Brand Kit",
    is_default: true,
    created_by: user.id,
  });

  if (kitResult.error) {
    return errorState("Brand was created, but the default brand kit could not be added.");
  }

  redirect("/dashboard");
}
