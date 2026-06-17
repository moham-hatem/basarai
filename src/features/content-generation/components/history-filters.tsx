import Link from "next/link";
import type {
  GenerationHistoryFilters,
  HistoryPlatformFilter,
  HistoryProviderFilter,
  HistoryStatusFilter,
} from "@/features/content-generation/queries";

const statusOptions: { label: string; value: HistoryStatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
];

const platformOptions: { label: string; value: HistoryPlatformFilter }[] = [
  { label: "All", value: "all" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "Instagram", value: "instagram" },
  { label: "Facebook", value: "facebook" },
  { label: "X/Twitter", value: "x" },
];

const providerOptions: { label: string; value: HistoryProviderFilter }[] = [
  { label: "All", value: "all" },
  { label: "OpenAI", value: "openai" },
  { label: "Gemini", value: "gemini" },
];

function createFilterHref(
  filters: GenerationHistoryFilters,
  next: Partial<GenerationHistoryFilters>,
): string {
  const merged = { ...filters, ...next };
  const params = new URLSearchParams();

  if (merged.status !== "all") {
    params.set("status", merged.status);
  }

  if (merged.platform !== "all") {
    params.set("platform", merged.platform);
  }

  if (merged.provider !== "all") {
    params.set("provider", merged.provider);
  }

  const query = params.toString();
  return query ? `/history?${query}` : "/history";
}

function FilterGroup<TValue extends string>({
  activeValue,
  filters,
  label,
  name,
  options,
}: {
  activeValue: TValue;
  filters: GenerationHistoryFilters;
  label: string;
  name: keyof GenerationHistoryFilters;
  options: { label: string; value: TValue }[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option.value === activeValue;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "rounded-md bg-emerald-800 px-3 py-2 text-sm font-medium text-white dark:bg-emerald-500 dark:text-stone-950"
                  : "rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-emerald-700 hover:text-emerald-800 dark:border-stone-700 dark:text-stone-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
              }
              href={createFilterHref(filters, { [name]: option.value })}
              key={option.value}
            >
              {option.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function HistoryFilters({
  filters,
}: {
  filters: GenerationHistoryFilters;
}) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="grid gap-5 lg:grid-cols-3">
        <FilterGroup
          activeValue={filters.status}
          filters={filters}
          label="Status"
          name="status"
          options={statusOptions}
        />
        <FilterGroup
          activeValue={filters.platform}
          filters={filters}
          label="Platform"
          name="platform"
          options={platformOptions}
        />
        <FilterGroup
          activeValue={filters.provider}
          filters={filters}
          label="Provider"
          name="provider"
          options={providerOptions}
        />
      </div>
    </section>
  );
}
