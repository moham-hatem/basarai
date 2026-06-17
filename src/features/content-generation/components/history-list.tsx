import { HistoryItem } from "@/features/content-generation/components/history-item";
import type { GenerationHistoryItem } from "@/features/content-generation/queries";

export function HistoryList({ items }: { items: GenerationHistoryItem[] }) {
  if (items.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center shadow-sm dark:border-stone-700 dark:bg-stone-900">
        <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-50">
          No generation history yet
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
          Generated content and failed generation attempts for the active brand
          will appear here.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {items.map((item) => (
        <HistoryItem item={item} key={item.id} />
      ))}
    </section>
  );
}
