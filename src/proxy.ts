import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_PATHS = [
  "/",
  "/pricing",
  "/auth/login",
  "/auth/signup",
  "/refund-policy",
  "/privacy-policy",
  "/auth/reset-password",
  "/terms-and-conditions",
  "/auth/forgot-password",
];

const GUEST_ONLY_PATHS = ["/auth/login", "/auth/signup", "/auth/forgot-password"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"));
}

function isGuestOnly(pathname: string) {
  return GUEST_ONLY_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"));
}

/**
 * Optimistic route protection: this only checks that a session cookie is
 * present, it does not validate it. Every protected page and route handler
 * independently calls getSessionUser(), which is what actually enforces access.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = !!getSessionCookie(request);

  if (hasSession && isGuestOnly(pathname)) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  if (!hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// API routes are excluded deliberately. Every one of them authenticates itself
// (or verifies a provider signature), so the proxy adds nothing there. It also
// does real harm: Next buffers the whole request body in memory for a proxied
// request, capped at 10 MB, and silently truncates anything larger. A speaking
// exam posts up to 16 recordings at once, so submissions were arriving with a
// half-read multipart body that could not be parsed.
export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest|txt|xml)$).*)",
  ],
};
