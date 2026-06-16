import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import type { UserBrand } from "@/features/brands/queries";

export function DashboardShell({
  brands,
  children,
}: {
  brands: UserBrand[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-950 dark:bg-stone-950 dark:text-stone-50 lg:flex">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader brands={brands} />
        <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
