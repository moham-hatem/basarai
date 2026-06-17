"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasSupabasePublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ACTIVE_BRAND_COOKIE_NAME,
  getActiveBrandForUser,
} from "@/features/brands/queries";
import type { AppRole, Json } from "@/lib/supabase/types";
import {
  createBrandSlug,
  createSlugSuffix,
  type CreateBrandInput,
  type CreateBrandFormState,
  type BrandKitFormState,
  type BrandSettingsFormState,
  type TeamMemberFormState,
  type ProviderKeyFormState,
  parseCreateBrandForm,
  parseBrandKitForm,
  parseBrandSettingsForm,
  parseManageableBrandRole,
  parseProviderFromForm,
  parseProviderKeyForm,
  parseTeamMemberEmail,
} from "@/features/brands/validation";

function errorState(message: string): CreateBrandFormState {
  return { status: "error", message };
}

function brandSettingsErrorState(message: string): BrandSettingsFormState {
  return { status: "error", message };
}

function brandSettingsSuccessState(message: string): BrandSettingsFormState {
  return { status: "success", message };
}

function brandKitErrorState(message: string): BrandKitFormState {
  return { status: "error", message };
}

function brandKitSuccessState(message: string): BrandKitFormState {
  return { status: "success", message };
}

function providerKeyErrorState(message: string): ProviderKeyFormState {
  return { status: "error", message };
}

function providerKeySuccessState(message: string): ProviderKeyFormState {
  return { status: "success", message };
}

function teamMemberErrorState(message: string): TeamMemberFormState {
  return { status: "error", message };
}

function teamMemberSuccessState(message: string): TeamMemberFormState {
  return { status: "success", message };
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

function canManageTargetRole({
  actorRole,
  targetRole,
}: {
  actorRole: AppRole;
  targetRole: AppRole;
}): boolean {
  if (actorRole === "owner") {
    return true;
  }

  return (
    actorRole === "admin" &&
    (targetRole === "editor" || targetRole === "viewer")
  );
}

function canAssignRole({
  actorRole,
  nextRole,
}: {
  actorRole: AppRole;
  nextRole: AppRole;
}): boolean {
  if (actorRole === "owner") {
    return nextRole === "admin" || nextRole === "editor" || nextRole === "viewer";
  }

  return actorRole === "admin" && (nextRole === "editor" || nextRole === "viewer");
}

function canEditBrandKit(role: AppRole): boolean {
  return role === "owner" || role === "admin" || role === "editor";
}

function canManageProviderKeys(role: AppRole): boolean {
  return role === "owner" || role === "admin";
}

function maskProviderKey(apiKey: string): string {
  const compactKey = apiKey.trim();
  const prefix = compactKey.slice(0, Math.min(7, compactKey.length));
  const suffix = compactKey.slice(-4);

  return `${prefix}...${suffix}`;
}

async function getActorAndTargetMemberships({
  brandId,
  targetUserId,
  supabase,
  userId,
}: {
  brandId: string;
  targetUserId: string;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  userId: string;
}): Promise<
  | {
      actorRole: AppRole;
      ok: true;
      targetRole: AppRole;
    }
  | { error: string; ok: false }
> {
  const { data: memberships, error } = await supabase
    .from("brand_members")
    .select("user_id, role")
    .eq("brand_id", brandId)
    .in("user_id", [userId, targetUserId]);

  if (error) {
    return { error: "Unable to verify member permissions.", ok: false };
  }

  const actorRole = memberships.find((member) => member.user_id === userId)?.role;
  const targetRole = memberships.find(
    (member) => member.user_id === targetUserId,
  )?.role;

  if (!actorRole || !targetRole) {
    return { error: "Unable to verify member permissions.", ok: false };
  }

  return { actorRole, ok: true, targetRole };
}

async function isLastOwner({
  brandId,
  supabase,
  targetRole,
}: {
  brandId: string;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  targetRole: AppRole;
}): Promise<boolean> {
  if (targetRole !== "owner") {
    return false;
  }

  const { count, error } = await supabase
    .from("brand_members")
    .select("user_id", { count: "exact", head: true })
    .eq("brand_id", brandId)
    .eq("role", "owner");

  return !error && (count ?? 0) <= 1;
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

export async function updateActiveBrandSettingsAction(
  _previousState: BrandSettingsFormState,
  formData: FormData,
): Promise<BrandSettingsFormState> {
  const brandId = formData.get("brandId");
  const parsed = parseBrandSettingsForm(formData);

  if (typeof brandId !== "string" || !isUuid(brandId)) {
    return brandSettingsErrorState("Unable to update brand settings.");
  }

  if (!parsed.data) {
    return brandSettingsErrorState(parsed.error);
  }

  if (!hasSupabasePublicEnv()) {
    return brandSettingsErrorState("Supabase is not configured for this environment.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("brand_members")
    .select("role")
    .eq("brand_id", brandId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    return brandSettingsErrorState("Unable to verify brand access.");
  }

  if (membership.role !== "owner" && membership.role !== "admin") {
    return brandSettingsErrorState(
      "You do not have permission to edit brand settings.",
    );
  }

  const input = parsed.data;
  const { error } = await supabase
    .from("brands")
    .update({
      name: input.name,
      industry: input.industry,
      website_url: input.websiteUrl,
      default_language: input.defaultLanguage,
      // Slug is intentionally unchanged until public brand URLs exist.
    })
    .eq("id", brandId);

  if (error) {
    return brandSettingsErrorState("Unable to update brand settings.");
  }

  revalidatePath("/settings");
  revalidatePath("/brands");
  revalidatePath("/dashboard");

  return brandSettingsSuccessState("Brand settings updated.");
}

export async function updateDefaultBrandKitAction(
  _previousState: BrandKitFormState,
  formData: FormData,
): Promise<BrandKitFormState> {
  const brandId = formData.get("brandId");
  const brandKitId = formData.get("brandKitId");
  const parsed = parseBrandKitForm(formData);

  if (
    typeof brandId !== "string" ||
    !isUuid(brandId) ||
    typeof brandKitId !== "string" ||
    !isUuid(brandKitId)
  ) {
    return brandKitErrorState("Unable to update the Brand Kit.");
  }

  if (!parsed.data) {
    return brandKitErrorState(parsed.error);
  }

  if (!hasSupabasePublicEnv()) {
    return brandKitErrorState("Supabase is not configured for this environment.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const activeBrand = await getActiveBrandForUser(user.id);

  if (!activeBrand || activeBrand.id !== brandId) {
    return brandKitErrorState("Unable to verify the active brand.");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("brand_members")
    .select("role")
    .eq("brand_id", activeBrand.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    return brandKitErrorState("Unable to verify brand access.");
  }

  if (!canEditBrandKit(membership.role)) {
    return brandKitErrorState("You do not have permission to edit the Brand Kit.");
  }

  const input = parsed.data;
  const guidelines: Json = {
    banned_words: input.bannedWords,
    competitors: input.competitors,
    examples: input.examples,
    personality_traits: input.personalityTraits,
    preferred_hashtags: input.preferredHashtags,
    preferred_words: input.preferredWords,
    primary_color: input.primaryColor,
    product_description: input.productDescription,
    secondary_color: input.secondaryColor,
    writing_rules: input.writingRules,
  };
  const { error } = await supabase
    .from("brand_kits")
    .update({
      audience: input.audience,
      banned_terms: input.bannedWords.join(", ") || null,
      guidelines,
      name: input.name,
      value_props: input.valueProposition,
      voice: input.toneOfVoice,
    })
    .eq("id", brandKitId)
    .eq("brand_id", activeBrand.id)
    .eq("is_default", true);

  if (error) {
    return brandKitErrorState("Unable to update the Brand Kit.");
  }

  revalidatePath("/settings");

  return brandKitSuccessState("Brand Kit updated.");
}

export async function saveProviderKeyAction(
  _previousState: ProviderKeyFormState,
  formData: FormData,
): Promise<ProviderKeyFormState> {
  const brandId = formData.get("brandId");
  const parsed = parseProviderKeyForm(formData);

  if (typeof brandId !== "string" || !isUuid(brandId)) {
    return providerKeyErrorState("Unable to save provider key.");
  }

  if (!parsed.data) {
    return providerKeyErrorState(parsed.error);
  }

  if (!hasSupabasePublicEnv()) {
    return providerKeyErrorState("Supabase is not configured for this environment.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const activeBrand = await getActiveBrandForUser(user.id);

  if (!activeBrand || activeBrand.id !== brandId) {
    return providerKeyErrorState("Unable to verify the active brand.");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("brand_members")
    .select("role")
    .eq("brand_id", activeBrand.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    return providerKeyErrorState("Unable to verify brand access.");
  }

  if (!canManageProviderKeys(membership.role)) {
    return providerKeyErrorState("You do not have permission to manage provider keys.");
  }

  const input = parsed.data;
  const { error: vaultError } = await supabase.rpc(
    "upsert_brand_provider_vault_secret",
    {
      key_label: input.label,
      masked_provider_key: maskProviderKey(input.apiKey),
      raw_provider_key: input.apiKey,
      target_brand_id: activeBrand.id,
      target_provider: input.provider,
    },
  );

  if (vaultError) {
    return providerKeyErrorState("Unable to store provider key securely.");
  }

  revalidatePath("/settings");

  return providerKeySuccessState("Provider key saved securely.");
}

export async function deleteProviderKeyAction(
  _previousState: ProviderKeyFormState,
  formData: FormData,
): Promise<ProviderKeyFormState> {
  const brandId = formData.get("brandId");
  const parsed = parseProviderFromForm(formData);

  if (typeof brandId !== "string" || !isUuid(brandId)) {
    return providerKeyErrorState("Unable to delete provider key.");
  }

  if (!parsed.data) {
    return providerKeyErrorState(parsed.error);
  }

  if (!hasSupabasePublicEnv()) {
    return providerKeyErrorState("Supabase is not configured for this environment.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const activeBrand = await getActiveBrandForUser(user.id);

  if (!activeBrand || activeBrand.id !== brandId) {
    return providerKeyErrorState("Unable to verify the active brand.");
  }

  const { data: membership, error: membershipError } = await supabase
    .from("brand_members")
    .select("role")
    .eq("brand_id", activeBrand.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membership) {
    return providerKeyErrorState("Unable to verify brand access.");
  }

  if (!canManageProviderKeys(membership.role)) {
    return providerKeyErrorState("You do not have permission to manage provider keys.");
  }

  const { error: vaultError } = await supabase.rpc(
    "delete_brand_provider_vault_secret",
    {
      target_brand_id: activeBrand.id,
      target_provider: parsed.data,
    },
  );

  if (vaultError) {
    return providerKeyErrorState("Unable to delete provider key securely.");
  }

  revalidatePath("/settings");

  return providerKeySuccessState("Provider key deleted.");
}

export async function addBrandMemberAction(
  _previousState: TeamMemberFormState,
  formData: FormData,
): Promise<TeamMemberFormState> {
  const brandId = formData.get("brandId");
  const parsedEmail = parseTeamMemberEmail(formData);
  const parsedRole = parseManageableBrandRole(formData);

  if (typeof brandId !== "string" || !isUuid(brandId)) {
    return teamMemberErrorState("Unable to add member.");
  }

  if (!parsedEmail.data) {
    return teamMemberErrorState(parsedEmail.error ?? "Enter a valid email address.");
  }

  if (!parsedRole.data) {
    return teamMemberErrorState(parsedRole.error);
  }

  if (!hasSupabasePublicEnv()) {
    return teamMemberErrorState("Supabase is not configured for this environment.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: actorMembership, error } = await supabase
    .from("brand_members")
    .select("role")
    .eq("brand_id", brandId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !actorMembership) {
    return teamMemberErrorState("Unable to verify brand access.");
  }

  if (!canAssignRole({ actorRole: actorMembership.role, nextRole: parsedRole.data })) {
    return teamMemberErrorState("You do not have permission to add that role.");
  }

  const { data: targetUserId, error: lookupError } = await supabase.rpc(
    "find_profile_id_by_email_for_brand_admin",
    {
      target_brand_id: brandId,
      target_email: parsedEmail.data,
    },
  );

  if (lookupError) {
    return teamMemberErrorState("Unable to look up that user.");
  }

  if (!targetUserId) {
    return teamMemberErrorState(
      "This user must create an account before being added to the brand.",
    );
  }

  const { data: existingMembership, error: existingError } = await supabase
    .from("brand_members")
    .select("user_id")
    .eq("brand_id", brandId)
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (existingError) {
    return teamMemberErrorState("Unable to check existing membership.");
  }

  if (existingMembership) {
    return teamMemberErrorState("This user is already a member of the brand.");
  }

  const { error: insertError } = await supabase.from("brand_members").insert({
    brand_id: brandId,
    user_id: targetUserId,
    role: parsedRole.data,
    invited_by: user.id,
  });

  if (insertError) {
    return teamMemberErrorState("Unable to add member.");
  }

  revalidatePath("/settings");

  return teamMemberSuccessState("Member added.");
}

export async function updateBrandMemberRoleAction(
  _previousState: TeamMemberFormState,
  formData: FormData,
): Promise<TeamMemberFormState> {
  const brandId = formData.get("brandId");
  const targetUserId = formData.get("userId");
  const parsedRole = parseManageableBrandRole(formData);

  if (
    typeof brandId !== "string" ||
    !isUuid(brandId) ||
    typeof targetUserId !== "string" ||
    !isUuid(targetUserId)
  ) {
    return teamMemberErrorState("Unable to update member role.");
  }

  if (!parsedRole.data) {
    return teamMemberErrorState(parsedRole.error);
  }

  if (!hasSupabasePublicEnv()) {
    return teamMemberErrorState("Supabase is not configured for this environment.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const memberships = await getActorAndTargetMemberships({
    brandId,
    targetUserId,
    supabase,
    userId: user.id,
  });

  if (!memberships.ok) {
    return teamMemberErrorState(memberships.error);
  }

  if (
    !canManageTargetRole({
      actorRole: memberships.actorRole,
      targetRole: memberships.targetRole,
    }) ||
    !canAssignRole({ actorRole: memberships.actorRole, nextRole: parsedRole.data })
  ) {
    return teamMemberErrorState("You do not have permission to update this member.");
  }

  if (
    memberships.targetRole === "owner" &&
    (await isLastOwner({ brandId, supabase, targetRole: memberships.targetRole }))
  ) {
    return teamMemberErrorState("The brand must have at least one owner.");
  }

  const { error } = await supabase
    .from("brand_members")
    .update({ role: parsedRole.data })
    .eq("brand_id", brandId)
    .eq("user_id", targetUserId);

  if (error) {
    return teamMemberErrorState("Unable to update member role.");
  }

  revalidatePath("/settings");

  return teamMemberSuccessState("Member role updated.");
}

export async function removeBrandMemberAction(
  _previousState: TeamMemberFormState,
  formData: FormData,
): Promise<TeamMemberFormState> {
  const brandId = formData.get("brandId");
  const targetUserId = formData.get("userId");

  if (
    typeof brandId !== "string" ||
    !isUuid(brandId) ||
    typeof targetUserId !== "string" ||
    !isUuid(targetUserId)
  ) {
    return teamMemberErrorState("Unable to remove member.");
  }

  if (!hasSupabasePublicEnv()) {
    return teamMemberErrorState("Supabase is not configured for this environment.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const memberships = await getActorAndTargetMemberships({
    brandId,
    targetUserId,
    supabase,
    userId: user.id,
  });

  if (!memberships.ok) {
    return teamMemberErrorState(memberships.error);
  }

  if (
    !canManageTargetRole({
      actorRole: memberships.actorRole,
      targetRole: memberships.targetRole,
    })
  ) {
    return teamMemberErrorState("You do not have permission to remove this member.");
  }

  if (await isLastOwner({ brandId, supabase, targetRole: memberships.targetRole })) {
    return teamMemberErrorState("The brand must have at least one owner.");
  }

  const { error } = await supabase
    .from("brand_members")
    .delete()
    .eq("brand_id", brandId)
    .eq("user_id", targetUserId);

  if (error) {
    return teamMemberErrorState("Unable to remove member.");
  }

  revalidatePath("/settings");

  return teamMemberSuccessState("Member removed.");
}
