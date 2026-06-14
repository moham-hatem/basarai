import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-stone-950 dark:text-stone-50">
          Reset password
        </h1>
        <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">
          Password reset email flow will be connected when Supabase Auth is added.
        </p>
      </div>

      <div className="rounded-md border border-dashed border-stone-300 p-4 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-300">
        Password reset form placeholder.
      </div>

      <Link className="text-sm font-medium text-emerald-800 dark:text-emerald-300" href="/login">
        Back to log in
      </Link>
    </div>
  );
}
