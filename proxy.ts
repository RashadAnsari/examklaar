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
  "/reset-password",
  "/auth",
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"));
}

export async function proxy(request: NextRequest) {
  if (isPublic(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  try {
    const { supabase, supabaseResponse } = createClient(request);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  } catch {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
