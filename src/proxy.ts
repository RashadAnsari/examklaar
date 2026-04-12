import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

const PUBLIC_PATHS = [
  "/",
  "/pricing",
  "/terms",
  "/privacy",
  "/login",
  "/signup",
  "/forgot-password",
  "/auth/callback",
  "/api/webhook/payment",
];

const GUEST_ONLY_PATHS = ["/login", "/signup", "/forgot-password"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"));
}

function isGuestOnly(pathname: string) {
  return GUEST_ONLY_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    const { supabase, supabaseResponse } = createClient(request);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session && isGuestOnly(pathname)) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard";
      return NextResponse.redirect(dashboardUrl);
    }

    if (isPublic(pathname)) {
      return supabaseResponse;
    }

    if (!session) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  } catch {
    if (isPublic(pathname)) {
      return NextResponse.next();
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
