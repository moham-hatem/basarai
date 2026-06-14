import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-stone-950 dark:text-stone-50">
          Log in
        </h1>
        <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">
          Authentication will be connected to Supabase in a later task.
        </p>
      </div>

      <div className="rounded-md border border-dashed border-stone-300 p-4 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-300">
        Login form placeholder.
      </div>

      <div className="flex items-center justify-between text-sm">
        <Link className="font-medium text-emerald-800 dark:text-emerald-300" href="/signup">
          Create account
        </Link>
        <Link
          className="font-medium text-emerald-800 dark:text-emerald-300"
          href="/reset-password"
        >
          Reset password
        </Link>
      </div>
    </div>
  );
}
