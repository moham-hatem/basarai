"use client";

import { useState } from "react";
import type { GenerationHistoryItem } from "@/features/content-generation/queries";
import type { GeneratedContentVariant } from "@/lib/ai/types";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatLabel(value: string): string {
  if (value === "ar_en") {
    return "Arabic + English";
  }

  if (value === "x") {
    return "X/Twitter";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function statusClassName(status: GenerationHistoryItem["status"]): string {
  if (status === "completed") {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200";
  }

  if (status === "failed") {
    return "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200";
  }

  return "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-200";
}

function CopyCaptionButton({ caption }: { caption: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCaption() {
    if (!caption || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(caption);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      className="rounded-md border border-stone-300 px-3 py-2 text-xs font-medium text-stone-700 transition hover:border-emerald-700 hover:text-emerald-800 dark:border-stone-700 dark:text-stone-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
      onClick={copyCaption}
      type="button"
    >
      {copied ? "Copied" : "Copy caption"}
    </button>
  );
}

function HistoryVariant({
  index,
  variant,
}: {
  index: number;
  variant: GeneratedContentVariant;
}) {
  return (
    <div className="rounded-md border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Variant {index + 1}
        </h3>
        <CopyCaptionButton caption={variant.caption} />
      </div>
      <div className="space-y-3 text-sm text-stone-700 dark:text-stone-300">
        {variant.hook ? (
          <p>
            <span className="font-medium text-stone-900 dark:text-stone-100">
              Hook:
            </span>{" "}
            {variant.hook}
          </p>
        ) : null}
        <p className="whitespace-pre-wrap leading-6">
          <span className="font-medium text-stone-900 dark:text-stone-100">
            Caption:
          </span>{" "}
          {variant.caption || "Not provided"}
        </p>
        {variant.cta ? (
          <p>
            <span className="font-medium text-stone-900 dark:text-stone-100">
              CTA:
            </span>{" "}
            {variant.cta}
          </p>
        ) : null}
        {variant.hashtags.length ? (
          <p>
            <span className="font-medium text-stone-900 dark:text-stone-100">
              Hashtags:
            </span>{" "}
            {variant.hashtags.join(" ")}
          </p>
        ) : null}
        {variant.image_prompt ? (
          <p className="whitespace-pre-wrap leading-6">
            <span className="font-medium text-stone-900 dark:text-stone-100">
              Image prompt:
            </span>{" "}
            {variant.image_prompt}
          </p>
        ) : null}
        {variant.notes ? (
          <p className="whitespace-pre-wrap leading-6">
            <span className="font-medium text-stone-900 dark:text-stone-100">
              Notes:
            </span>{" "}
            {variant.notes}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function HistoryItem({ item }: { item: GenerationHistoryItem }) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClassName(
                item.status,
              )}`}
            >
              {formatLabel(item.status)}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {formatDate(item.createdAt)}
            </span>
          </div>
          <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-50">
            {item.topic}
          </h2>
          <div className="flex flex-wrap gap-2 text-xs text-stone-600 dark:text-stone-300">
            <span>{formatLabel(item.platform)}</span>
            <span aria-hidden="true">/</span>
            <span>{formatLabel(item.provider)}</span>
            <span aria-hidden="true">/</span>
            <span>{formatLabel(item.language)}</span>
            {item.model ? (
              <>
                <span aria-hidden="true">/</span>
                <span>{item.model}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-stone-600 dark:text-stone-300 lg:justify-end">
          {item.tokensTotal > 0 ? (
            <span className="rounded-md bg-stone-100 px-2 py-1 dark:bg-stone-800">
              {item.tokensTotal} tokens
            </span>
          ) : null}
          {item.latencyMs !== null ? (
            <span className="rounded-md bg-stone-100 px-2 py-1 dark:bg-stone-800">
              {item.latencyMs} ms
            </span>
          ) : null}
        </div>
      </div>

      {item.status === "failed" ? (
        <div className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
          {item.errorMessage || "Unable to generate content right now."}
        </div>
      ) : null}

      {item.status === "completed" && item.output ? (
        <div className="mt-5 space-y-4">
          {item.output.variants.map((variant, index) => (
            <HistoryVariant
              index={index}
              key={`${item.id}-${index}`}
              variant={variant}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}
