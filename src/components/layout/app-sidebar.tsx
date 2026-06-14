"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/brands", label: "Brands" },
  { href: "/brand-kit", label: "Brand Kit" },
  { href: "/generator", label: "Generator" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
  { href: "/admin", label: "Admin" },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-stone-200 bg-stone-950 text-stone-50 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-6 px-4 py-5">
        <div className="flex items-center justify-between lg:block">
          <Link className="text-xl font-semibold tracking-wide" href="/">
            Basarai
          </Link>
          <span className="rounded-full border border-emerald-300/40 px-3 py-1 text-xs text-emerald-100 lg:mt-3 lg:inline-block">
            MVP
          </span>
        </div>

        <nav aria-label="Dashboard navigation" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-500 text-stone-950"
                    : "text-stone-300 hover:bg-stone-900 hover:text-white"
                }`}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
