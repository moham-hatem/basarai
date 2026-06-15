import { redirect } from "next/navigation";
import { hasSupabasePublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignupForm } from "@/features/auth/components/signup-form";

export default async function SignupPage() {
  if (hasSupabasePublicEnv()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/dashboard");
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-stone-950 dark:text-stone-50">
          Create account
        </h1>
        <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">
          Create your account. Brand onboarding will be added in a later task.
        </p>
      </div>

      <SignupForm />
    </div>
  );
}
