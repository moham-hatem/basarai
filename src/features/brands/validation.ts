export type CreateBrandFormState = {
  status: "idle" | "error";
  message: string;
};

export type BrandSettingsFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type BrandLanguage = "ar" | "en" | "ar_en";

export type CreateBrandInput = {
  name: string;
  industry: string | null;
  websiteUrl: string | null;
  defaultLanguage: BrandLanguage;
};

export type BrandSettingsInput = CreateBrandInput;

export const initialCreateBrandFormState: CreateBrandFormState = {
  status: "idle",
  message: "",
};

export const initialBrandSettingsFormState: BrandSettingsFormState = {
  status: "idle",
  message: "",
};

const brandLanguages = new Set<BrandLanguage>(["ar", "en", "ar_en"]);

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function createBrandSlug(name: string, suffix?: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const safeBase = base || "brand";

  return suffix ? `${safeBase}-${suffix}` : safeBase;
}

export function createSlugSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function parseCreateBrandForm(
  formData: FormData,
): { data: CreateBrandInput; error: null } | { data: null; error: string } {
  const name = readString(formData, "name");
  const industry = readString(formData, "industry");
  const websiteUrl = readString(formData, "websiteUrl");
  const defaultLanguage = readString(formData, "defaultLanguage");

  if (name.length < 2) {
    return { data: null, error: "Brand name must be at least 2 characters." };
  }

  if (name.length > 80) {
    return { data: null, error: "Brand name must be 80 characters or less." };
  }

  if (!brandLanguages.has(defaultLanguage as BrandLanguage)) {
    return { data: null, error: "Choose a supported default language." };
  }

  if (websiteUrl && !/^https?:\/\/.+/i.test(websiteUrl)) {
    return { data: null, error: "Website URL must start with http:// or https://." };
  }

  return {
    data: {
      name,
      industry: industry || null,
      websiteUrl: websiteUrl || null,
      defaultLanguage: defaultLanguage as BrandLanguage,
    },
    error: null,
  };
}

export function parseBrandSettingsForm(
  formData: FormData,
): { data: BrandSettingsInput; error: null } | { data: null; error: string } {
  return parseCreateBrandForm(formData);
}
