import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-stone-950 dark:text-stone-50">
          Reset password
        </h1>
        <p className="text-sm leading-6 text-stone-600 dark:text-stone-300">
          Request a secure password reset email for your Basarai account.
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  );
}
