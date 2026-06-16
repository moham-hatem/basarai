import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requireCurrentUserBrand } from "@/features/brands/guards";

export default async function AdminPage() {
  await requireCurrentUserBrand();

  return (
    <PagePlaceholder
      cardText="Admin controls, audit views, and membership safeguards will be implemented in a later task."
      description="Manage higher-trust operational controls for owners and admins."
      title="Admin"
    />
  );
}
