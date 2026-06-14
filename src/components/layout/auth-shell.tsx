import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link className="text-2xl font-semibold tracking-wide" href="/">
            Basarai
          </Link>
          <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">
            Brand-based social content generation.
          </p>
        </div>

        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-950">
          {children}
        </section>
      </div>
    </main>
  );
}
