"use client";

import { useActionState } from "react";
import { FormSubmitButton } from "@/features/auth/components/form-submit-button";
import { addBrandMemberAction } from "@/features/brands/actions";
import type { AppRole } from "@/lib/supabase/types";
import { initialTeamMemberFormState } from "@/features/brands/validation";

export function AddMemberForm({
  actorRole,
  brandId,
}: {
  actorRole: AppRole;
  brandId: string;
}) {
  const [state, formAction] = useActionState(
    addBrandMemberAction,
    initialTeamMemberFormState,
  );
  const roleOptions =
    actorRole === "owner"
      ? ["admin", "editor", "viewer"]
      : ["editor", "viewer"];

  return (
    <form action={formAction} className="space-y-4">
      <input name="brandId" type="hidden" value={brandId} />

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-stone-800 dark:text-stone-200"
            htmlFor="member-email"
          >
            Email
          </label>
          <input
            className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-emerald-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
            id="member-email"
            name="email"
            placeholder="teammate@example.com"
            required
            type="email"
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-stone-800 dark:text-stone-200"
            htmlFor="member-role"
          >
            Role
          </label>
          <select
            className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-emerald-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
            defaultValue={roleOptions[0]}
            id="member-role"
            name="role"
          >
            {roleOptions.map((role) => (
              <option className="capitalize" key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
              : "rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200"
          }
        >
          {state.message}
        </p>
      ) : null}

      <FormSubmitButton pendingText="Checking member...">
        Add member
      </FormSubmitButton>
    </form>
  );
}
