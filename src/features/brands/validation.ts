export type CreateBrandFormState = {
  status: "idle" | "error";
  message: string;
};

export type BrandSettingsFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type TeamMemberFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type BrandKitFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type BrandLanguage = "ar" | "en" | "ar_en";
export type ManageableBrandRole = "admin" | "editor" | "viewer";

export type CreateBrandInput = {
  name: string;
  industry: string | null;
  websiteUrl: string | null;
  defaultLanguage: BrandLanguage;
};

export type BrandSettingsInput = CreateBrandInput;

export type BrandKitInput = {
  audience: string | null;
  bannedWords: string[];
  competitors: string[];
  examples: string[];
  name: string;
  personalityTraits: string[];
  preferredHashtags: string[];
  preferredWords: string[];
  primaryColor: string | null;
  productDescription: string | null;
  secondaryColor: string | null;
  toneOfVoice: string | null;
  valueProposition: string | null;
  writingRules: string[];
};

export const initialCreateBrandFormState: CreateBrandFormState = {
  status: "idle",
  message: "",
};

export const initialBrandSettingsFormState: BrandSettingsFormState = {
  status: "idle",
  message: "",
};

export const initialTeamMemberFormState: TeamMemberFormState = {
  status: "idle",
  message: "",
};

export const initialBrandKitFormState: BrandKitFormState = {
  status: "idle",
  message: "",
};

const brandLanguages = new Set<BrandLanguage>(["ar", "en", "ar_en"]);
const manageableBrandRoles = new Set<ManageableBrandRole>([
  "admin",
  "editor",
  "viewer",
]);

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readDelimitedList(formData: FormData, key: string): string[] {
  return readString(formData, key)
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 50);
}

function readOptionalColor(
  formData: FormData,
  key: string,
): { data: string | null; error: null } | { data: null; error: string } {
  const value = readString(formData, key);

  if (!value) {
    return { data: null, error: null };
  }

  if (!/^#[0-9a-f]{6}$/i.test(value)) {
    return { data: null, error: "Colors must use a hex value like #0f766e." };
  }

  return { data: value, error: null };
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

export function parseManageableBrandRole(
  formData: FormData,
): { data: ManageableBrandRole; error: null } | { data: null; error: string } {
  const role = readString(formData, "role");

  if (!manageableBrandRoles.has(role as ManageableBrandRole)) {
    return { data: null, error: "Choose a supported role." };
  }

  return { data: role as ManageableBrandRole, error: null };
}

export function parseTeamMemberEmail(
  formData: FormData,
): { data: string; error: null } | { data: null; error: string } {
  const email = readString(formData, "email").toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { data: null, error: "Enter a valid email address." };
  }

  return { data: email, error: null };
}

export function parseBrandKitForm(
  formData: FormData,
): { data: BrandKitInput; error: null } | { data: null; error: string } {
  const name = readString(formData, "name");
  const primaryColor = readOptionalColor(formData, "primaryColor");
  const secondaryColor = readOptionalColor(formData, "secondaryColor");

  if (name.length < 2) {
    return { data: null, error: "Brand Kit name must be at least 2 characters." };
  }

  if (name.length > 80) {
    return { data: null, error: "Brand Kit name must be 80 characters or less." };
  }

  if (primaryColor.error) {
    return { data: null, error: primaryColor.error };
  }

  if (secondaryColor.error) {
    return { data: null, error: secondaryColor.error };
  }

  return {
    data: {
      audience: readString(formData, "audience") || null,
      bannedWords: readDelimitedList(formData, "bannedWords"),
      competitors: readDelimitedList(formData, "competitors"),
      examples: readDelimitedList(formData, "examples"),
      name,
      personalityTraits: readDelimitedList(formData, "personalityTraits"),
      preferredHashtags: readDelimitedList(formData, "preferredHashtags"),
      preferredWords: readDelimitedList(formData, "preferredWords"),
      primaryColor: primaryColor.data,
      productDescription: readString(formData, "productDescription") || null,
      secondaryColor: secondaryColor.data,
      toneOfVoice: readString(formData, "toneOfVoice") || null,
      valueProposition: readString(formData, "valueProposition") || null,
      writingRules: readDelimitedList(formData, "writingRules"),
    },
    error: null,
  };
}
