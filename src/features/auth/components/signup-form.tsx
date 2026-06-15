"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "@/features/auth/actions";
import { FormSubmitButton } from "@/features/auth/components/form-submit-button";
import { initialAuthFormState } from "@/features/auth/validation";

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, initialAuthFormState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-800 dark:text-stone-200" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-emerald-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
          id="email"
          name="email"
          required
          type="email"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-800 dark:text-stone-200" htmlFor="password">
          Password
        </label>
        <input
          autoComplete="new-password"
          className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-emerald-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
          id="password"
          minLength={8}
          name="password"
          required
          type="password"
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-stone-800 dark:text-stone-200"
          htmlFor="confirmPassword"
        >
          Confirm password
        </label>
        <input
          autoComplete="new-password"
          className="h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-950 outline-none focus:border-emerald-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-50"
          id="confirmPassword"
          minLength={8}
          name="confirmPassword"
          required
          type="password"
        />
      </div>

      {state.message ? (
        <p
          className={`rounded-md px-3 py-2 text-sm ${
            state.status === "error"
              ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200"
              : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <FormSubmitButton pendingText="Creating account...">
        Create account
      </FormSubmitButton>

      <p className="text-sm text-stone-600 dark:text-stone-300">
        Already have an account?{" "}
        <Link className="font-medium text-emerald-800 dark:text-emerald-300" href="/login">
          Log in
        </Link>
      </p>
    </form>
  );
}
