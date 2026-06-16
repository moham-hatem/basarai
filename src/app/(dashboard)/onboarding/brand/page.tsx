import { redirect } from "next/navigation";
import { CreateBrandForm } from "@/features/brands/components/create-brand-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserBrandCount } from "@/features/brands/queries";

export default async function BrandOnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const brandCount = await getCurrentUserBrandCount(user.id);

  if (brandCount > 0) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">
          Create your first brand
        </h1>
        <p className="text-base leading-7 text-stone-600 dark:text-stone-300">
          Create your first brand to start generating social content.
        </p>
      </div>

      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <CreateBrandForm />
      </section>
    </div>
  );
}
