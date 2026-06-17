"use client";

import { useActionState, useEffect, useRef } from "react";
import { FormSubmitButton } from "@/features/auth/components/form-submit-button";
import { saveProviderKeyAction } from "@/features/brands/actions";
import {
  initialProviderKeyFormState,
  type ProviderKeyFormState,
} from "@/features/brands/validation";

export function ProviderKeyForm({ brandId }: { brandId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState<ProviderKeyFormState, FormData>(
    saveProviderKeyAction,
    initialProviderKeyFormState,
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form action={formAction} className="space-y-4" ref={formRef}>
      <input name="brandId" type="hidden" value={brandId} />

      <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-stone-800 dark:text-stone-200"
            htmlFor="provider"
          >
            Provider
          </label>
          <select
            className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-emerald-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
            defaultValue="openai"
            id="provider"
            name="provider"
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-stone-800 dark:text-stone-200"
            htmlFor="api-key"
          >
            API key
          </label>
          <input
            autoComplete="off"
            className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-emerald-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
            id="api-key"
            name="apiKey"
            required
            type="password"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-stone-800 dark:text-stone-200"
          htmlFor="provider-label"
        >
          Label
        </label>
        <input
          className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-emerald-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
          id="provider-label"
          maxLength={80}
          name="label"
          placeholder="Production key"
          type="text"
        />
      </div>

      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
              : "rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200"
          }
        >
          {state.message}
        </p>
      ) : null}

      <FormSubmitButton pendingText="Saving provider key...">
        Save provider key
      </FormSubmitButton>
    </form>
  );
}
