import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requireCurrentUserBrand } from "@/features/brands/guards";

export default async function GeneratorPage() {
  await requireCurrentUserBrand();

  return (
    <PagePlaceholder
      cardText="Generator form will be implemented in a later task."
      description="Generate platform-specific content for LinkedIn, Instagram, Facebook, and X/Twitter."
      title="Social Media Generator"
    />
  );
}
