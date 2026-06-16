"use client";

import { useActionState } from "react";
import { FormSubmitButton } from "@/features/auth/components/form-submit-button";
import { updateActiveBrandSettingsAction } from "@/features/brands/actions";
import type { BrandSettingsDetails } from "@/features/brands/queries";
import {
  initialBrandSettingsFormState,
  type BrandSettingsFormState,
} from "@/features/brands/validation";

function fieldClassName(canEdit: boolean): string {
  const disabledStyles = canEdit
    ? "bg-white dark:bg-stone-900"
    : "bg-stone-100 text-stone-500 dark:bg-stone-950 dark:text-stone-400";

  return `h-11 w-full rounded-md border border-stone-300 px-3 text-sm text-stone-950 outline-none focus:border-emerald-700 disabled:cursor-not-allowed dark:border-stone-700 dark:text-stone-50 ${disabledStyles}`;
}

export function BrandSettingsForm({
  brand,
  canEdit,
}: {
  brand: BrandSettingsDetails;
  canEdit: boolean;
}) {
  const [state, formAction] = useActionState<
    BrandSettingsFormState,
    FormData
  >(updateActiveBrandSettingsAction, initialBrandSettingsFormState);

  return (
    <form action={formAction} className="space-y-5">
      <input name="brandId" type="hidden" value={brand.id} />

      <fieldset className="space-y-5" disabled={!canEdit}>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-stone-800 dark:text-stone-200"
            htmlFor="name"
          >
            Brand name
          </label>
          <input
            className={fieldClassName(canEdit)}
            defaultValue={brand.name}
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
              className={fieldClassName(canEdit)}
              defaultValue={brand.industry ?? ""}
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
              className={fieldClassName(canEdit)}
              defaultValue={brand.defaultLanguage}
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
            className={fieldClassName(canEdit)}
            defaultValue={brand.websiteUrl ?? ""}
            id="websiteUrl"
            name="websiteUrl"
            placeholder="https://example.com"
            type="url"
          />
        </div>
      </fieldset>

      {canEdit ? (
        <>
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
          <FormSubmitButton pendingText="Saving settings...">
            Save settings
          </FormSubmitButton>
        </>
      ) : (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          You do not have permission to edit brand settings.
        </p>
      )}
    </form>
  );
}
