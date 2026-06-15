"use client";

import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  children: string;
  pendingText: string;
};

export function FormSubmitButton({
  children,
  pendingText,
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className="flex h-11 w-full items-center justify-center rounded-md bg-emerald-800 px-4 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-stone-400 dark:bg-emerald-500 dark:text-stone-950 dark:hover:bg-emerald-400"
      disabled={pending}
      type="submit"
    >
      {pending ? pendingText : children}
    </button>
  );
}
