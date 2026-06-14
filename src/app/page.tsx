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
          <span className="text-sm text-stone-700 dark:text-stone-300">
            MVP foundation
          </span>
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
