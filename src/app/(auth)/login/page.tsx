import { redirect } from "next/navigation";
import { hasSupabasePublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LoginForm } from "@/features/auth/components/login-form";

export default async function LoginPage() {
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
          Log in
        </h1>
        <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">
          Sign in with the email and password for your Basarai account.
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
