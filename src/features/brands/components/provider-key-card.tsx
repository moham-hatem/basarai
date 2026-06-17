"use client";

import { useActionState } from "react";
import {
  deleteProviderKeyAction,
  testProviderKeyAction,
} from "@/features/brands/actions";
import type { BrandProviderKeyMetadata } from "@/features/brands/queries";
import {
  initialProviderKeyFormState,
  type ProviderKeyFormState,
} from "@/features/brands/validation";

function formatProvider(provider: BrandProviderKeyMetadata["provider"]): string {
  return provider === "openai" ? "OpenAI" : "Gemini";
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Not tested yet";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatStatus(value: string | null): string {
  const normalized = value ?? "untested";

  if (normalized === "valid") {
    return "Valid";
  }

  if (normalized === "invalid") {
    return "Invalid";
  }

  if (normalized === "failed") {
    return "Failed";
  }

  return "Untested";
}

export function ProviderKeyCard({
  brandId,
  canManage,
  providerKey,
}: {
  brandId: string;
  canManage: boolean;
  providerKey: BrandProviderKeyMetadata;
}) {
  const [state, formAction] = useActionState<ProviderKeyFormState, FormData>(
    deleteProviderKeyAction,
    initialProviderKeyFormState,
  );
  const [testState, testFormAction] = useActionState<
    ProviderKeyFormState,
    FormData
  >(testProviderKeyAction, initialProviderKeyFormState);

  return (
    <article className="space-y-4 rounded-lg border border-stone-200 p-4 dark:border-stone-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-stone-950 dark:text-stone-50">
            {formatProvider(providerKey.provider)}
          </h3>
          <p className="font-mono text-xs text-stone-500 dark:text-stone-400">
            {providerKey.maskedKey}
          </p>
        </div>
        <span
          className={
            providerKey.isActive
              ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
              : "rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300"
          }
        >
          {providerKey.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-stone-500 dark:text-stone-400">Test status</dt>
          <dd className="capitalize text-stone-800 dark:text-stone-100">
            {formatStatus(providerKey.lastTestStatus)}
          </dd>
        </div>
        <div>
          <dt className="text-stone-500 dark:text-stone-400">Last tested</dt>
          <dd className="text-stone-800 dark:text-stone-100">
            {formatDate(providerKey.lastTestedAt)}
          </dd>
        </div>
      </dl>

      {canManage ? (
        <div className="flex flex-wrap gap-2">
          <form action={testFormAction} className="space-y-2">
            <input name="brandId" type="hidden" value={brandId} />
            <input name="provider" type="hidden" value={providerKey.provider} />
            <button
              className="h-9 rounded-md border border-stone-200 px-3 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 dark:border-stone-800 dark:text-stone-200 dark:hover:bg-stone-950"
              type="submit"
            >
              Test key
            </button>
            {testState.message ? (
              <p
                className={
                  testState.status === "success"
                    ? "text-xs text-emerald-700 dark:text-emerald-300"
                    : "text-xs text-amber-700 dark:text-amber-300"
                }
              >
                {testState.message}
              </p>
            ) : null}
          </form>
          <form action={formAction} className="space-y-2">
            <input name="brandId" type="hidden" value={brandId} />
            <input name="provider" type="hidden" value={providerKey.provider} />
            <button
              className="h-9 rounded-md border border-red-200 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
              type="submit"
            >
              Delete
            </button>
            {state.message ? (
              <p
                className={
                  state.status === "success"
                    ? "text-xs text-emerald-700 dark:text-emerald-300"
                    : "text-xs text-red-700 dark:text-red-300"
                }
              >
                {state.message}
              </p>
            ) : null}
          </form>
        </div>
      ) : null}
    </article>
  );
}
