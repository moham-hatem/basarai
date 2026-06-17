import { redirect } from "next/navigation";
import { GeneratorForm } from "@/features/content-generation/components/generator-form";
import { requireCurrentUserBrand } from "@/features/brands/guards";
import { getBrandSettingsForUser } from "@/features/brands/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function GeneratorPage() {
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

  const canGenerate =
    brandSettings.role === "owner" ||
    brandSettings.role === "admin" ||
    brandSettings.role === "editor";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">
          Social Media Generator
        </h1>
        <p className="max-w-2xl text-base leading-7 text-stone-600 dark:text-stone-300">
          Generate platform-specific content for LinkedIn, Instagram, Facebook,
          and X/Twitter using the active brand and Brand Kit.
        </p>
      </div>

      <GeneratorForm
        canGenerate={canGenerate}
        defaultLanguage={brandSettings.defaultLanguage}
      />
    </div>
  );
}
