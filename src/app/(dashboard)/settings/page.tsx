import { redirect } from "next/navigation";
import { BrandKitForm } from "@/features/brands/components/brand-kit-form";
import { BrandSettingsForm } from "@/features/brands/components/brand-settings-form";
import { TeamSettings } from "@/features/brands/components/team-settings";
import { requireCurrentUserBrand } from "@/features/brands/guards";
import {
  getBrandSettingsForUser,
  getBrandTeamMembers,
  getDefaultBrandKitForUser,
} from "@/features/brands/queries";
import {
  isSettingsTabId,
  SettingsTabs,
  type SettingsTabId,
} from "@/features/settings/components/settings-tabs";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SettingsPageSearchParams = {
  tab?: string | string[];
};

const placeholderTabs: Record<
  Exclude<SettingsTabId, "brand" | "brand-kit" | "team">,
  { description: string; note: string; title: string }
> = {
  "ai-providers": {
    description: "Connect OpenAI or Gemini using BYOK.",
    note: "Provider key management will be implemented in a later task.",
    title: "AI Providers",
  },
  usage: {
    description: "Track content generation activity and usage limits.",
    note: "Usage analytics will be implemented in a later task.",
    title: "Usage",
  },
};

function resolveSettingsTab(searchParams: SettingsPageSearchParams): SettingsTabId {
  const tab = Array.isArray(searchParams.tab)
    ? searchParams.tab[0]
    : searchParams.tab;

  return isSettingsTabId(tab) ? tab : "brand";
}

function SettingsPlaceholderCard({
  description,
  note,
  title,
}: {
  description: string;
  note: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-50">
          {title}
        </h2>
        <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">
          {description}
        </p>
      </div>
      <div className="mt-5 rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300">
        {note}
      </div>
    </section>
  );
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<SettingsPageSearchParams>;
}) {
  const activeTab = resolveSettingsTab(await searchParams);
  const activeBrand = await requireCurrentUserBrand();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const brandSettings = await getBrandSettingsForUser({
    brandId: activeBrand.id,
    userId: user.id,
  });

  if (!brandSettings) {
    redirect("/onboarding/brand");
  }

  const canEdit =
    brandSettings.role === "owner" || brandSettings.role === "admin";
  const canEditBrandKit =
    brandSettings.role === "owner" ||
    brandSettings.role === "admin" ||
    brandSettings.role === "editor";
  const teamMembers =
    activeTab === "team"
      ? await getBrandTeamMembers({ brandId: activeBrand.id })
      : [];
  const brandKit =
    activeTab === "brand-kit"
      ? await getDefaultBrandKitForUser({
          allowCreate: canEditBrandKit,
          brandId: activeBrand.id,
          userId: user.id,
        })
      : null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">
          Settings
        </h1>
        <p className="max-w-2xl text-base leading-7 text-stone-600 dark:text-stone-300">
          Manage settings for the active brand.
        </p>
      </div>

      <SettingsTabs activeTab={activeTab} />

      {activeTab === "brand" ? (
        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="mb-5 space-y-1">
            <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-50">
              Brand
            </h2>
            <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">
              Manage the basic details for {brandSettings.name}. Slug remains
              unchanged when the brand name is edited.
            </p>
          </div>

          <BrandSettingsForm brand={brandSettings} canEdit={canEdit} />
        </section>
      ) : null}

      {activeTab === "team" ? (
        <TeamSettings
          actorRole={brandSettings.role}
          brandId={activeBrand.id}
          currentUserId={user.id}
          members={teamMembers}
        />
      ) : null}

      {activeTab === "brand-kit" ? (
        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="mb-5 space-y-1">
            <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-50">
              Brand Kit
            </h2>
            <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">
              Define the voice, audience, rules, and content preferences for
              this brand.
            </p>
          </div>

          {brandKit ? (
            <BrandKitForm
              brandId={activeBrand.id}
              brandKit={brandKit}
              canEdit={canEditBrandKit}
            />
          ) : (
            <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300">
              Unable to load the default Brand Kit for this brand.
            </div>
          )}
        </section>
      ) : null}

      {activeTab !== "brand" &&
      activeTab !== "brand-kit" &&
      activeTab !== "team" ? (
        <SettingsPlaceholderCard {...placeholderTabs[activeTab]} />
      ) : (
        null
      )}
    </div>
  );
}
