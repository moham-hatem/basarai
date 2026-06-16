import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requireCurrentUserBrand } from "@/features/brands/guards";

export default async function HistoryPage() {
  await requireCurrentUserBrand();

  return (
    <PagePlaceholder
      cardText="Generation history, filters, and saved outputs will be implemented in a later task."
      description="Browse previous generations for the selected Brand tenant."
      title="History"
    />
  );
}
