import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requireCurrentUserBrand } from "@/features/brands/guards";

export default async function DashboardPage() {
  await requireCurrentUserBrand();

  return (
    <PagePlaceholder
      cardText="Dashboard metrics and recent generation activity will be implemented in a later task."
      description="Review brand activity, content status, and quick links for the active tenant."
      title="Dashboard"
    />
  );
}
