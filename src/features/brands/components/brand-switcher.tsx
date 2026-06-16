"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import { setActiveBrandAction } from "@/features/brands/actions";
import type { UserBrand } from "@/features/brands/queries";

export function BrandSwitcher({
  activeBrandId,
  brands,
}: {
  activeBrandId: string | null;
  brands: UserBrand[];
}) {
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);

  if (brands.length === 0) {
    return (
      <select
        className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-900 shadow-sm outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        defaultValue="none"
        disabled
        id="brand-switcher"
      >
        <option value="none">No brand selected</option>
      </select>
    );
  }

  return (
    <form action={setActiveBrandAction} ref={formRef}>
      <input name="returnTo" type="hidden" value={pathname} />
      <select
        className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-900 shadow-sm outline-none focus:border-emerald-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        defaultValue={activeBrandId ?? brands[0]?.id}
        id="brand-switcher"
        name="brandId"
        onChange={() => formRef.current?.requestSubmit()}
      >
        {brands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>
    </form>
  );
}
