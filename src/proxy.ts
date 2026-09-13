import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Optimistic, cookie-only check — fast redirect before any rendering happens.
// This is NOT the security boundary: a Proxy matcher does not protect Server
// Actions called on the same path, so every mutating action and studio page
// independently re-checks the real session and role via src/lib/auth/dal.ts.
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/studio/:path*", "/account/:path*"],
};
