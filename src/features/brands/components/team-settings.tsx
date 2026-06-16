import { AddMemberForm } from "@/features/brands/components/add-member-form";
import { MemberRoleForm } from "@/features/brands/components/member-role-form";
import { RemoveMemberButton } from "@/features/brands/components/remove-member-button";
import type { BrandTeamMember } from "@/features/brands/queries";
import type { AppRole } from "@/lib/supabase/types";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

function canManageMember({
  actorRole,
  memberRole,
}: {
  actorRole: AppRole;
  memberRole: AppRole;
}): boolean {
  if (actorRole === "owner") {
    return true;
  }

  return (
    actorRole === "admin" &&
    (memberRole === "editor" || memberRole === "viewer")
  );
}

export function TeamSettings({
  actorRole,
  brandId,
  currentUserId,
  members,
}: {
  actorRole: AppRole;
  brandId: string;
  currentUserId: string;
  members: BrandTeamMember[];
}) {
  const canManageTeam = actorRole === "owner" || actorRole === "admin";

  return (
    <section className="space-y-6 rounded-lg border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-stone-950 dark:text-stone-50">
          Team & Roles
        </h2>
        <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">
          Manage members and permissions for this brand.
        </p>
      </div>

      {canManageTeam ? (
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950">
          <div className="mb-4 space-y-1">
            <h3 className="text-sm font-semibold text-stone-950 dark:text-stone-50">
              Add member
            </h3>
            <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">
              Members must already have an account. Owner role cannot be added
              from this form.
            </p>
          </div>
          <AddMemberForm actorRole={actorRole} brandId={brandId} />
        </div>
      ) : (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          You do not have permission to manage team members.
        </p>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-stone-950 dark:text-stone-50">
            Members
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {members.length} total
          </p>
        </div>

        <div className="divide-y divide-stone-200 rounded-lg border border-stone-200 dark:divide-stone-800 dark:border-stone-800">
          {members.map((member) => {
            const canManage = canManageMember({
              actorRole,
              memberRole: member.role,
            });

            return (
              <article
                className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.5fr)_120px_minmax(220px,0.9fr)]"
                key={member.userId}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-medium text-stone-950 dark:text-stone-50">
                      {member.fullName ?? "Profile name unavailable"}
                    </h4>
                    {member.userId === currentUserId ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                        You
                      </span>
                    ) : null}
                  </div>
                  <p className="break-all font-mono text-xs text-stone-500 dark:text-stone-400">
                    {member.userId}
                  </p>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {member.email ?? "Email not available"}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Added {formatDate(member.createdAt)}
                  </p>
                </div>

                <div>
                  <span className="inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium capitalize text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                    {member.role}
                  </span>
                </div>

                <div className="space-y-3">
                  {canManageTeam && canManage ? (
                    <>
                      <MemberRoleForm
                        actorRole={actorRole}
                        brandId={brandId}
                        memberRole={member.role}
                        userId={member.userId}
                      />
                      <RemoveMemberButton
                        brandId={brandId}
                        userId={member.userId}
                      />
                    </>
                  ) : (
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      Read-only
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
