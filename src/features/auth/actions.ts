"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hasSupabasePublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  type AuthFormState,
  isValidEmail,
  readRequiredString,
  validateEmailPassword,
} from "@/features/auth/validation";

function missingConfigState(): AuthFormState {
  return {
    status: "error",
    message: "Supabase is not configured for this environment.",
  };
}

function safeAuthError(message = "Authentication failed. Please try again."): AuthFormState {
  return {
    status: "error",
    message,
  };
}

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readRequiredString(formData, "email");
  const password = readRequiredString(formData, "password");
  const validationError = validateEmailPassword(email, password);

  if (validationError) {
    return safeAuthError(validationError);
  }

  if (!hasSupabasePublicEnv()) {
    return missingConfigState();
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return safeAuthError("Invalid email or password.");
  }

  redirect("/dashboard");
}

export async function signupAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readRequiredString(formData, "email");
  const password = readRequiredString(formData, "password");
  const confirmPassword = readRequiredString(formData, "confirmPassword");
  const validationError = validateEmailPassword(email, password);

  if (validationError) {
    return safeAuthError(validationError);
  }

  if (password !== confirmPassword) {
    return safeAuthError("Passwords do not match.");
  }

  if (!hasSupabasePublicEnv()) {
    return missingConfigState();
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return safeAuthError("Unable to create an account. Please try again.");
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return {
    status: "success",
    message: "Check your email to confirm your account before logging in.",
  };
}

export async function resetPasswordAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = readRequiredString(formData, "email");

  if (!isValidEmail(email)) {
    return safeAuthError("Enter a valid email address.");
  }

  if (!hasSupabasePublicEnv()) {
    return missingConfigState();
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? "";
  const redirectTo = origin ? `${origin}/login` : undefined;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    return safeAuthError("Unable to send a reset email. Please try again.");
  }

  return {
    status: "success",
    message: "If an account exists for that email, a reset link has been sent.",
  };
}

export async function logoutAction() {
  if (hasSupabasePublicEnv()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
