import type { BrandId } from "@/features/brands/types";

export type BrandRole = "owner" | "admin" | "editor" | "viewer";

export type BrandMembership = {
  userId: string;
  brandId: BrandId;
  role: BrandRole;
};
