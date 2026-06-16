import { LogoutButton } from "@/features/auth/components/logout-button";
import { BrandSwitcher } from "@/features/brands/components/brand-switcher";
import type { UserBrand } from "@/features/brands/queries";

export function DashboardHeader({
  activeBrand,
  brands,
}: {
  activeBrand: UserBrand | null;
  brands: UserBrand[];
}) {
  return (
    <header className="border-b border-stone-200 bg-white/80 px-5 py-4 backdrop-blur dark:border-stone-800 dark:bg-stone-950/80 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
            Workspace
          </p>
          <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-50">
            Content operations
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <label
              className="text-sm font-medium text-stone-600 dark:text-stone-300"
              htmlFor="brand-switcher"
            >
              Brand
            </label>
            <BrandSwitcher
              activeBrandId={activeBrand?.id ?? null}
              brands={brands}
            />
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
