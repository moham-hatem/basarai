import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import {
  getActiveBrandForUser,
  getUserBrands,
} from "@/features/brands/queries";
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
  const activeBrand = await getActiveBrandForUser(user.id, brands);

  return (
    <DashboardShell activeBrand={activeBrand} brands={brands}>
      {children}
    </DashboardShell>
  );
}
