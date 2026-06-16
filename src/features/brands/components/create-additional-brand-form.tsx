import { createAdditionalBrandAction } from "@/features/brands/actions";
import { CreateBrandForm } from "@/features/brands/components/create-brand-form";

export function CreateAdditionalBrandForm() {
  return (
    <CreateBrandForm
      action={createAdditionalBrandAction}
      pendingText="Adding brand..."
      submitText="Add brand"
    />
  );
}
