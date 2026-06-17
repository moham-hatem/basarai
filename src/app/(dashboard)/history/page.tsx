import { redirect } from "next/navigation";
import { requireCurrentUserBrand } from "@/features/brands/guards";
import { HistoryFilters } from "@/features/content-generation/components/history-filters";
import { HistoryList } from "@/features/content-generation/components/history-list";
import {
  getGenerationHistoryForBrand,
  parseGenerationHistoryFilters,
} from "@/features/content-generation/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type HistoryPageSearchParams = {
  platform?: string | string[];
  provider?: string | string[];
  status?: string | string[];
};

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<HistoryPageSearchParams>;
}) {
  const activeBrand = await requireCurrentUserBrand();
  const filters = parseGenerationHistoryFilters(await searchParams);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const history = await getGenerationHistoryForBrand({
    brandId: activeBrand.id,
    filters,
    userId: user.id,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">
          History
        </h1>
        <p className="max-w-2xl text-base leading-7 text-stone-600 dark:text-stone-300">
          Browse completed and failed generation attempts for the active brand.
        </p>
      </div>

      <HistoryFilters filters={filters} />
      <HistoryList items={history} />
    </div>
  );
}
