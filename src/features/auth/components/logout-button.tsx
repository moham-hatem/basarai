import { logoutAction } from "@/features/auth/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        className="h-10 rounded-md border border-stone-300 px-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-900"
        type="submit"
      >
        Log out
      </button>
    </form>
  );
}
