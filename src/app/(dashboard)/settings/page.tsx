import { redirect } from "next/navigation";
import { BrandSettingsForm } from "@/features/brands/components/brand-settings-form";
import { requireCurrentUserBrand } from "@/features/brands/guards";
import { getBrandSettingsForUser } from "@/features/brands/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
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

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">
          Brand Settings
        </h1>
        <p className="max-w-2xl text-base leading-7 text-stone-600 dark:text-stone-300">
          Manage the basic details for the active brand.
        </p>
      </div>

      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <div className="mb-5 space-y-1">
          <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-50">
            {brandSettings.name}
          </h2>
          <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">
            Slug remains unchanged when the brand name is edited.
          </p>
        </div>

        <BrandSettingsForm brand={brandSettings} canEdit={canEdit} />
      </section>
    </div>
  );
}
