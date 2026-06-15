export type AuthFormState = {
  status: "idle" | "error" | "success";
  message: string;
};

export const initialAuthFormState: AuthFormState = {
  status: "idle",
  message: "",
};

export function readRequiredString(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateEmailPassword(email: string, password: string): string | null {
  if (!isValidEmail(email)) {
    return "Enter a valid email address.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  return null;
}
