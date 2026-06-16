import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requireCurrentUserBrand } from "@/features/brands/guards";

export default async function BrandKitPage() {
  await requireCurrentUserBrand();

  return (
    <PagePlaceholder
      cardText="Brand voice, audience, offers, banned terms, and asset management will be implemented in a later task."
      description="Collect the reusable brand context that guides Arabic and English content generation."
      title="Brand Kit"
    />
  );
}
