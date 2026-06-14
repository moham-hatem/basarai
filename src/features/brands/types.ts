export type BrandId = string;

export type BrandLocale = "en" | "ar";

export type Brand = {
  id: BrandId;
  name: string;
  defaultLocale: BrandLocale;
  createdAt: string;
};
