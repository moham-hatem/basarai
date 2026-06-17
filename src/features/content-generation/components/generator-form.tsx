"use client";

import { useActionState } from "react";
import { FormSubmitButton } from "@/features/auth/components/form-submit-button";
import { generateContentAction } from "@/features/content-generation/actions";
import { GeneratedResults } from "@/features/content-generation/components/generated-results";
import {
  generationGoals,
  generationLanguages,
  generationPlatforms,
  generationProviders,
  initialContentGenerationFormState,
  type ContentGenerationFormState,
} from "@/features/content-generation/validation";
import type { OutputLanguage } from "@/lib/supabase/types";

function fieldClassName(canGenerate: boolean): string {
  const disabledStyles = canGenerate
    ? "bg-white dark:bg-stone-900"
    : "bg-stone-100 text-stone-500 dark:bg-stone-950 dark:text-stone-400";

  return `w-full rounded-md border border-stone-300 px-3 text-sm text-stone-950 outline-none focus:border-emerald-700 disabled:cursor-not-allowed dark:border-stone-700 dark:text-stone-50 ${disabledStyles}`;
}

function inputClassName(canGenerate: boolean): string {
  return `${fieldClassName(canGenerate)} h-11`;
}

function textareaClassName(canGenerate: boolean): string {
  return `${fieldClassName(canGenerate)} min-h-32 py-2 leading-6`;
}

export function GeneratorForm({
  canGenerate,
  defaultLanguage,
}: {
  canGenerate: boolean;
  defaultLanguage: OutputLanguage;
}) {
  const [state, formAction] = useActionState<
    ContentGenerationFormState,
    FormData
  >(generateContentAction, initialContentGenerationFormState);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <form action={formAction} className="space-y-5">
          <fieldset className="space-y-5" disabled={!canGenerate}>
            <div className="grid gap-5 md:grid-cols-2">
              <SelectField
                canGenerate={canGenerate}
                id="platform"
                label="Platform"
                name="platform"
                options={generationPlatforms}
              />
              <SelectField
                canGenerate={canGenerate}
                defaultValue={defaultLanguage}
                id="language"
                label="Language"
                name="language"
                options={generationLanguages}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <SelectField
                canGenerate={canGenerate}
                id="provider"
                label="AI provider"
                name="provider"
                options={generationProviders}
              />
              <SelectField
                canGenerate={canGenerate}
                id="goal"
                label="Goal"
                name="goal"
                options={generationGoals}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-[1fr_160px]">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-stone-800 dark:text-stone-200"
                  htmlFor="tone-override"
                >
                  Tone override
                </label>
                <input
                  className={inputClassName(canGenerate)}
                  id="tone-override"
                  maxLength={160}
                  name="toneOverride"
                  placeholder="Optional"
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-stone-800 dark:text-stone-200"
                  htmlFor="number-of-variants"
                >
                  Variants
                </label>
                <input
                  className={inputClassName(canGenerate)}
                  defaultValue={3}
                  id="number-of-variants"
                  max={5}
                  min={1}
                  name="numberOfVariants"
                  required
                  type="number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-stone-800 dark:text-stone-200"
                htmlFor="topic"
              >
                Topic
              </label>
              <textarea
                className={textareaClassName(canGenerate)}
                id="topic"
                maxLength={2000}
                name="topic"
                placeholder="Describe the post idea, launch, campaign, offer, or message."
                required
              />
            </div>
          </fieldset>

          {canGenerate ? (
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
              <FormSubmitButton pendingText="Generating content...">
                Generate content
              </FormSubmitButton>
            </>
          ) : (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              You do not have permission to generate content for this brand.
            </p>
          )}
        </form>
      </section>

      {state.result ? <GeneratedResults result={state.result} /> : null}
    </div>
  );
}

function SelectField<TValue extends string>({
  canGenerate,
  defaultValue,
  id,
  label,
  name,
  options,
}: {
  canGenerate: boolean;
  defaultValue?: TValue;
  id: string;
  label: string;
  name: string;
  options: { label: string; value: TValue }[];
}) {
  return (
    <div className="space-y-2">
      <label
        className="text-sm font-medium text-stone-800 dark:text-stone-200"
        htmlFor={id}
      >
        {label}
      </label>
      <select
        className={inputClassName(canGenerate)}
        defaultValue={defaultValue ?? options[0]?.value}
        id={id}
        name={name}
        required
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
