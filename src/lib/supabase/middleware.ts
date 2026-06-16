import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getSupabasePublicEnv,
  hasSupabasePublicEnv,
  shouldRequireSupabasePublicEnv,
} from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

const protectedDashboardPaths = [
  "/dashboard",
  "/brands",
  "/brand-kit",
  "/generator",
  "/history",
  "/settings",
  "/admin",
] as const;

function isProtectedDashboardPath(pathname: string): boolean {
  return (
    protectedDashboardPaths.includes(
      pathname as (typeof protectedDashboardPaths)[number],
    ) || pathname.startsWith("/onboarding")
  );
}

export async function updateSupabaseSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-basarai-pathname", pathname);
  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (!hasSupabasePublicEnv()) {
    if (shouldRequireSupabasePublicEnv()) {
      getSupabasePublicEnv();
    }

    return response;
  }

  const { url, publishableKey } = getSupabasePublicEnv();
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isProtectedDashboardPath(pathname)) {
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: membership } = await supabase
    .from("brand_members")
    .select("brand_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const isOnboardingPath = pathname === "/onboarding/brand";

  if (!membership && !isOnboardingPath) {
    return NextResponse.redirect(new URL("/onboarding/brand", request.url));
  }

  if (membership && isOnboardingPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
