import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-stone-950 dark:text-stone-50">
          Create account
        </h1>
        <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">
          Signup will invite users into a Brand tenant after auth is implemented.
        </p>
      </div>

      <div className="rounded-md border border-dashed border-stone-300 p-4 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-300">
        Signup form placeholder.
      </div>

      <p className="text-sm text-stone-600 dark:text-stone-300">
        Already have an account?{" "}
        <Link className="font-medium text-emerald-800 dark:text-emerald-300" href="/login">
          Log in
        </Link>
      </p>
    </div>
  );
}
