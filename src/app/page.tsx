import Link from "next/link";
import { appConfig } from "@/lib/config";

export default function Home() {
  const pillars = [
    "Tenant isolation by brand",
    "Server-side AI generation",
    "Arabic and English workflows",
    "BYOK OpenAI and Gemini",
  ];

  return (
    <main className="min-h-screen px-6 py-8 sm:px-10 lg:px-16">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between border-b border-stone-300/70 pb-5 dark:border-stone-700">
          <span className="text-lg font-semibold tracking-wide">
            {appConfig.name}
          </span>
          <nav aria-label="Primary" className="flex items-center gap-3">
            <Link
              className="text-sm font-medium text-stone-700 transition hover:text-emerald-800 dark:text-stone-300 dark:hover:text-emerald-300"
              href="/login"
            >
              Log in
            </Link>
            <Link
              className="rounded-md bg-emerald-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-900 dark:bg-emerald-500 dark:text-stone-950 dark:hover:bg-emerald-400"
              href="/signup"
            >
              Create account
            </Link>
          </nav>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-7">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-300">
              Brand-based social generation
            </p>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-stone-950 dark:text-stone-50">
                Multi-tenant content operations for Arabic and English brands.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-700 dark:text-stone-300">
                Basarai will help teams store brand context, generate channel
                ready social copy, and keep every AI request server-side with
                tenant-scoped Supabase policies.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className="flex h-11 items-center justify-center rounded-md bg-emerald-800 px-5 text-sm font-semibold text-white transition hover:bg-emerald-900 dark:bg-emerald-500 dark:text-stone-950 dark:hover:bg-emerald-400"
                href="/dashboard"
              >
                Go to dashboard
              </Link>
              <Link
                className="flex h-11 items-center justify-center rounded-md border border-stone-300 px-5 text-sm font-semibold text-stone-800 transition hover:border-emerald-700 hover:text-emerald-800 dark:border-stone-700 dark:text-stone-100 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
                href="/login"
              >
                Log in
              </Link>
              <Link
                className="flex h-11 items-center justify-center rounded-md border border-stone-300 px-5 text-sm font-semibold text-stone-800 transition hover:border-emerald-700 hover:text-emerald-800 dark:border-stone-700 dark:text-stone-100 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
                href="/signup"
              >
                Create account
              </Link>
            </div>

            <p className="max-w-2xl rounded-md bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              You can test content generation using Demo provider without OpenAI
              or Gemini credits.
            </p>
          </div>

          <div className="grid gap-3 rounded-lg border border-stone-300 bg-white/70 p-5 shadow-sm dark:border-stone-700 dark:bg-stone-950/60">
            {pillars.map((pillar) => (
              <div
                className="flex items-center justify-between gap-4 border-b border-stone-200 py-3 text-sm last:border-b-0 dark:border-stone-800"
                key={pillar}
              >
                <span className="font-medium text-stone-900 dark:text-stone-100">
                  {pillar}
                </span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-700 dark:bg-emerald-300" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
