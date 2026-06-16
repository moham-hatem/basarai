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
  let response = NextResponse.next({ request });

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
        response = NextResponse.next({ request });

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

  return response;
}
