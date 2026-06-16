import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveBrandForUser, type UserBrand } from "@/features/brands/queries";

export async function requireCurrentUserBrand(): Promise<UserBrand> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const brand = await getActiveBrandForUser(user.id);

  if (!brand) {
    redirect("/onboarding/brand");
  }

  return brand;
}
