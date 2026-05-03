import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Expensive AI/ML routes get a tight per-IP limit; all other API routes get a
// generous limit just to prevent runaway scripts.
const TIGHT_ROUTES = ["/api/recordings/transcribe", "/api/exams/grade"];
const TIGHT_LIMIT = { max: 10, windowMs: 5 * 60 * 1000 }; // 10 / 5 min
const API_LIMIT = { max: 60, windowMs: 60 * 1000 }; // 60 / 1 min

const PUBLIC_PATHS = [
  "/",
  "/pricing",
  "/auth/login",
  "/auth/signup",
  "/auth/callback",
  "/refund-policy",
  "/privacy-policy",
  "/terms-and-conditions",
  "/auth/forgot-password",
  "/api/payments/webhook",
];

const GUEST_ONLY_PATHS = ["/auth/login", "/auth/signup", "/auth/forgot-password"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"));
}

function isGuestOnly(pathname: string) {
  return GUEST_ONLY_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"));
}

function applyRateLimit(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/api/") || pathname.startsWith("/api/payments/webhook")) {
    return null;
  }
  const ip = getClientIp(request);
  const isTight = TIGHT_ROUTES.some((r) => pathname.startsWith(r));
  const { max, windowMs } = isTight ? TIGHT_LIMIT : API_LIMIT;
  const { allowed, retryAfterSeconds } = checkRateLimit(
    `api:${isTight ? pathname : ""}:${ip}`,
    max,
    windowMs
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

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
      loginUrl.pathname = "/auth/login";
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  } catch {
    if (isPublic(pathname)) {
      return NextResponse.next();
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
