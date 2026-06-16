import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requireCurrentUserBrand } from "@/features/brands/guards";

export default async function SettingsPage() {
  await requireCurrentUserBrand();

  return (
    <PagePlaceholder
      cardText="Workspace settings, locale preferences, and BYOK provider setup will be implemented in a later task."
      description="Configure tenant-level preferences without exposing provider keys to browser code."
      title="Settings"
    />
  );
}
