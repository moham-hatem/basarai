import { redirect } from "next/navigation";
import { CreateAdditionalBrandForm } from "@/features/brands/components/create-additional-brand-form";
import { requireCurrentUserBrand } from "@/features/brands/guards";
import { getUserBrandDetails } from "@/features/brands/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OutputLanguage } from "@/lib/supabase/types";

const languageLabels: Record<OutputLanguage, string> = {
  ar: "Arabic",
  ar_en: "Arabic + English",
  en: "English",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export default async function BrandsPage() {
  const activeBrand = await requireCurrentUserBrand();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const brands = await getUserBrandDetails(user.id);

  if (brands.length === 0) {
    redirect("/onboarding/brand");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">
          Brands
        </h1>
        <p className="max-w-2xl text-base leading-7 text-stone-600 dark:text-stone-300">
          Manage the brands you create content for.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="mb-5 space-y-1">
            <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-50">
              Create brand
            </h2>
            <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">
              Add another tenant workspace and make it active immediately.
            </p>
          </div>
          <CreateAdditionalBrandForm />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-50">
              Your brands
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {brands.length} total
            </p>
          </div>

          <div className="grid gap-4">
            {brands.map((brand) => {
              const isActive = brand.id === activeBrand.id;

              return (
                <article
                  className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"
                  key={brand.id}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-stone-950 dark:text-stone-50">
                          {brand.name}
                        </h3>
                        {isActive ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                            Active
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        {brand.industry ?? "No industry set"}
                      </p>
                    </div>

                    <div className="text-left text-sm text-stone-600 dark:text-stone-300 sm:text-right">
                      <p className="font-medium capitalize text-stone-900 dark:text-stone-100">
                        {brand.role}
                      </p>
                      <p>Created {formatDate(brand.createdAt)}</p>
                    </div>
                  </div>

                  <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="font-medium text-stone-500 dark:text-stone-400">
                        Website
                      </dt>
                      <dd className="mt-1 text-stone-900 dark:text-stone-100">
                        {brand.websiteUrl ? (
                          <a
                            className="text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300"
                            href={brand.websiteUrl}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {brand.websiteUrl}
                          </a>
                        ) : (
                          "No website set"
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-stone-500 dark:text-stone-400">
                        Default language
                      </dt>
                      <dd className="mt-1 text-stone-900 dark:text-stone-100">
                        {languageLabels[brand.defaultLanguage]}
                      </dd>
                    </div>
                  </dl>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
