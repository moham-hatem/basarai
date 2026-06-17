import { ProviderKeyCard } from "@/features/brands/components/provider-key-card";
import { ProviderKeyForm } from "@/features/brands/components/provider-key-form";
import type { BrandProviderKeyMetadata } from "@/features/brands/queries";
import type { AppRole } from "@/lib/supabase/types";

export function AiProvidersSettings({
  actorRole,
  brandId,
  providerKeys,
}: {
  actorRole: AppRole;
  brandId: string;
  providerKeys: BrandProviderKeyMetadata[];
}) {
  const canManage = actorRole === "owner" || actorRole === "admin";

  return (
    <section className="space-y-6 rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-50">
          AI Providers
        </h2>
        <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">
          Connect OpenAI or Gemini using BYOK.
        </p>
      </div>

      {canManage ? (
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950">
          <div className="mb-4 space-y-1">
            <h3 className="text-sm font-semibold text-stone-950 dark:text-stone-50">
              Add or replace provider key
            </h3>
            <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">
              Raw keys are sent only to the server action, stored in Supabase
              Vault, and never saved in public metadata tables.
            </p>
          </div>
          <ProviderKeyForm brandId={brandId} />
        </div>
      ) : (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          You do not have permission to manage AI provider keys.
        </p>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-stone-950 dark:text-stone-50">
            Connected providers
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {providerKeys.length} total
          </p>
        </div>

        {providerKeys.length > 0 ? (
          <div className="grid gap-3">
            {providerKeys.map((providerKey) => (
              <ProviderKeyCard
                brandId={brandId}
                canManage={canManage}
                key={providerKey.id}
                providerKey={providerKey}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300">
            No provider keys are connected yet.
          </div>
        )}
      </div>
    </section>
  );
}
