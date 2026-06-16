"use client";

import { useActionState } from "react";
import { createFirstBrandAction } from "@/features/brands/actions";
import { initialCreateBrandFormState } from "@/features/brands/validation";
import { FormSubmitButton } from "@/features/auth/components/form-submit-button";

export function CreateBrandForm() {
  const [state, formAction] = useActionState(
    createFirstBrandAction,
    initialCreateBrandFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-800 dark:text-stone-200" htmlFor="name">
          Brand name
        </label>
        <input
          className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-emerald-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
          id="name"
          maxLength={80}
          name="name"
          required
          type="text"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-stone-800 dark:text-stone-200"
            htmlFor="industry"
          >
            Industry
          </label>
          <input
            className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-emerald-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
            id="industry"
            name="industry"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-stone-800 dark:text-stone-200"
            htmlFor="defaultLanguage"
          >
            Default language
          </label>
          <select
            className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-emerald-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
            defaultValue="en"
            id="defaultLanguage"
            name="defaultLanguage"
            required
          >
            <option value="en">English</option>
            <option value="ar">Arabic</option>
            <option value="ar_en">Arabic + English</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-stone-800 dark:text-stone-200"
          htmlFor="websiteUrl"
        >
          Website URL
        </label>
        <input
          className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-emerald-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
          id="websiteUrl"
          name="websiteUrl"
          placeholder="https://example.com"
          type="url"
        />
      </div>

      {state.message ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {state.message}
        </p>
      ) : null}

      <FormSubmitButton pendingText="Creating brand...">
        Create brand
      </FormSubmitButton>
    </form>
  );
}
