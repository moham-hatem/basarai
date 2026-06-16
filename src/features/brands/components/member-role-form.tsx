"use client";

import { useActionState } from "react";
import { updateBrandMemberRoleAction } from "@/features/brands/actions";
import { initialTeamMemberFormState } from "@/features/brands/validation";
import type { AppRole } from "@/lib/supabase/types";

function RoleSubmitButton() {
  return (
    <button
      className="h-9 rounded-md bg-stone-950 px-3 text-xs font-semibold text-white transition hover:bg-stone-800 dark:bg-stone-50 dark:text-stone-950 dark:hover:bg-stone-200"
      type="submit"
    >
      Save
    </button>
  );
}

export function MemberRoleForm({
  actorRole,
  brandId,
  memberRole,
  userId,
}: {
  actorRole: AppRole;
  brandId: string;
  memberRole: AppRole;
  userId: string;
}) {
  const [state, formAction] = useActionState(
    updateBrandMemberRoleAction,
    initialTeamMemberFormState,
  );
  const roleOptions =
    actorRole === "owner"
      ? ["admin", "editor", "viewer"]
      : ["editor", "viewer"];
  const canUseCurrentValue = roleOptions.includes(memberRole);

  return (
    <form action={formAction} className="space-y-2">
      <input name="brandId" type="hidden" value={brandId} />
      <input name="userId" type="hidden" value={userId} />
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="h-9 rounded-md border border-stone-300 bg-white px-2 text-xs capitalize text-stone-950 outline-none focus:border-emerald-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
          defaultValue={memberRole}
          name="role"
        >
          {canUseCurrentValue ? null : (
            <option disabled value={memberRole}>
              {memberRole}
            </option>
          )}
          {roleOptions.map((role) => (
            <option className="capitalize" key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <RoleSubmitButton />
      </div>
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
