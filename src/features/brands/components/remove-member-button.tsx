"use client";

import { useActionState } from "react";
import { removeBrandMemberAction } from "@/features/brands/actions";
import { initialTeamMemberFormState } from "@/features/brands/validation";

function RemoveSubmitButton() {
  return (
    <button
      className="h-9 rounded-md border border-red-200 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
      type="submit"
    >
      Remove
    </button>
  );
}

export function RemoveMemberButton({
  brandId,
  userId,
}: {
  brandId: string;
  userId: string;
}) {
  const [state, formAction] = useActionState(
    removeBrandMemberAction,
    initialTeamMemberFormState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input name="brandId" type="hidden" value={brandId} />
      <input name="userId" type="hidden" value={userId} />
      <RemoveSubmitButton />
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
  );
}
