"use client";

import { useActionState } from "react";
import { FormSubmitButton } from "@/features/auth/components/form-submit-button";
import { updateDefaultBrandKitAction } from "@/features/brands/actions";
import type { BrandKitDetails } from "@/features/brands/queries";
import {
  initialBrandKitFormState,
  type BrandKitFormState,
} from "@/features/brands/validation";

function fieldClassName(canEdit: boolean): string {
  const disabledStyles = canEdit
    ? "bg-white dark:bg-stone-900"
    : "bg-stone-100 text-stone-500 dark:bg-stone-950 dark:text-stone-400";

  return `w-full rounded-md border border-stone-300 px-3 text-sm text-stone-950 outline-none focus:border-emerald-700 disabled:cursor-not-allowed dark:border-stone-700 dark:text-stone-50 ${disabledStyles}`;
}

function textInputClassName(canEdit: boolean): string {
  return `${fieldClassName(canEdit)} h-11`;
}

function textareaClassName(canEdit: boolean): string {
  return `${fieldClassName(canEdit)} min-h-24 py-2 leading-6`;
}

function joinValues(values: string[]): string {
  return values.join(", ");
}

function joinExamples(values: string[]): string {
  return values.join("\n");
}

export function BrandKitForm({
  brandId,
  brandKit,
  canEdit,
}: {
  brandId: string;
  brandKit: BrandKitDetails;
  canEdit: boolean;
}) {
  const [state, formAction] = useActionState<BrandKitFormState, FormData>(
    updateDefaultBrandKitAction,
    initialBrandKitFormState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input name="brandId" type="hidden" value={brandId} />
      <input name="brandKitId" type="hidden" value={brandKit.id} />

      <fieldset className="space-y-5" disabled={!canEdit}>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-stone-800 dark:text-stone-200"
            htmlFor="brand-kit-name"
          >
            Brand Kit name
          </label>
          <input
            className={textInputClassName(canEdit)}
            defaultValue={brandKit.name}
            id="brand-kit-name"
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
              htmlFor="tone-of-voice"
            >
              Tone of voice
            </label>
            <input
              className={textInputClassName(canEdit)}
              defaultValue={brandKit.toneOfVoice ?? ""}
              id="tone-of-voice"
              name="toneOfVoice"
              type="text"
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-stone-800 dark:text-stone-200"
              htmlFor="audience"
            >
              Audience
            </label>
            <input
              className={textInputClassName(canEdit)}
              defaultValue={brandKit.audience ?? ""}
              id="audience"
              name="audience"
              type="text"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-stone-800 dark:text-stone-200"
            htmlFor="product-description"
          >
            Product description
          </label>
          <textarea
            className={textareaClassName(canEdit)}
            defaultValue={brandKit.productDescription ?? ""}
            id="product-description"
            name="productDescription"
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-stone-800 dark:text-stone-200"
            htmlFor="value-proposition"
          >
            Value proposition
          </label>
          <textarea
            className={textareaClassName(canEdit)}
            defaultValue={brandKit.valueProposition ?? ""}
            id="value-proposition"
            name="valueProposition"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-stone-800 dark:text-stone-200"
              htmlFor="primary-color"
            >
              Primary color
            </label>
            <input
              className={textInputClassName(canEdit)}
              defaultValue={brandKit.primaryColor ?? ""}
              id="primary-color"
              name="primaryColor"
              placeholder="#0f766e"
              type="text"
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-stone-800 dark:text-stone-200"
              htmlFor="secondary-color"
            >
              Secondary color
            </label>
            <input
              className={textInputClassName(canEdit)}
              defaultValue={brandKit.secondaryColor ?? ""}
              id="secondary-color"
              name="secondaryColor"
              placeholder="#1f2937"
              type="text"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-stone-800 dark:text-stone-200"
              htmlFor="personality-traits"
            >
              Personality traits
            </label>
            <textarea
              className={textareaClassName(canEdit)}
              defaultValue={joinValues(brandKit.personalityTraits)}
              id="personality-traits"
              name="personalityTraits"
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-stone-800 dark:text-stone-200"
              htmlFor="writing-rules"
            >
              Writing rules
            </label>
            <textarea
              className={textareaClassName(canEdit)}
              defaultValue={joinValues(brandKit.writingRules)}
              id="writing-rules"
              name="writingRules"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-stone-800 dark:text-stone-200"
              htmlFor="banned-words"
            >
              Banned words
            </label>
            <textarea
              className={textareaClassName(canEdit)}
              defaultValue={joinValues(brandKit.bannedWords)}
              id="banned-words"
              name="bannedWords"
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-stone-800 dark:text-stone-200"
              htmlFor="preferred-words"
            >
              Preferred words
            </label>
            <textarea
              className={textareaClassName(canEdit)}
              defaultValue={joinValues(brandKit.preferredWords)}
              id="preferred-words"
              name="preferredWords"
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-stone-800 dark:text-stone-200"
              htmlFor="preferred-hashtags"
            >
              Preferred hashtags
            </label>
            <textarea
              className={textareaClassName(canEdit)}
              defaultValue={joinValues(brandKit.preferredHashtags)}
              id="preferred-hashtags"
              name="preferredHashtags"
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-stone-800 dark:text-stone-200"
              htmlFor="competitors"
            >
              Competitors
            </label>
            <textarea
              className={textareaClassName(canEdit)}
              defaultValue={joinValues(brandKit.competitors)}
              id="competitors"
              name="competitors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-stone-800 dark:text-stone-200"
            htmlFor="examples"
          >
            Examples
          </label>
          <textarea
            className={`${textareaClassName(canEdit)} min-h-32`}
            defaultValue={joinExamples(brandKit.examples)}
            id="examples"
            name="examples"
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
          <FormSubmitButton pendingText="Saving Brand Kit...">
            Save Brand Kit
          </FormSubmitButton>
        </>
      ) : (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          You do not have permission to edit the Brand Kit.
        </p>
      )}
    </form>
  );
}
