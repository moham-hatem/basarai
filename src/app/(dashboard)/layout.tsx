import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getUserBrands } from "@/features/brands/queries";
import { hasSupabasePublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!hasSupabasePublicEnv()) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const brands = await getUserBrands(user.id);
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-basarai-pathname") ?? "";
  const isOnboardingPath = pathname === "/onboarding/brand";

  if (!brands.length && !isOnboardingPath) {
    redirect("/onboarding/brand");
  }

  if (brands.length > 0 && isOnboardingPath) {
    redirect("/dashboard");
  }

  return <DashboardShell brands={brands}>{children}</DashboardShell>;
}
