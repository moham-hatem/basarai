import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requireCurrentUserBrand } from "@/features/brands/guards";

export default async function BrandsPage() {
  await requireCurrentUserBrand();

  return (
    <PagePlaceholder
      cardText="Brand creation, membership, and tenant management will be implemented in a later task."
      description="Manage Brand tenants, team access, and the workspace context used across Basarai."
      title="Brands"
    />
  );
}
