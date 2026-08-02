import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const BASE = "/astelpo_26";
const PUBLIC = [
  `${BASE}/login`,
  `${BASE}/forgot-password`,
  `${BASE}/join`,
  `${BASE}/view`,
  `${BASE}/register`,
];
const PENDING_PAGE = `${BASE}/pending-approval`;

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith(BASE)) return NextResponse.next();

  const isPublic = PUBLIC.some((p) => pathname.startsWith(p));
  const isLoggedIn = !!req.auth;
  const accountStatus = (req.auth?.user as { accountStatus?: string } | undefined)?.accountStatus;
  const userRole = (req.auth?.user as { role?: string } | undefined)?.role;
  const isAdmin = userRole === "ADMIN";
  // Treat missing/undefined accountStatus as non-ACTIVE — never grant access by default.
  const isActive = accountStatus === "ACTIVE";

  // ── Unauthenticated ───────────────────────────────────────────────────────
  if (!isLoggedIn) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL(`${BASE}/login`, req.url));
  }

  // ── Authenticated admin: full access, no status checks ───────────────────
  if (isAdmin) {
    if (pathname === `${BASE}/login`) return NextResponse.redirect(new URL(`${BASE}/today`, req.url));
    if (pathname === BASE) return NextResponse.redirect(new URL(`${BASE}/today`, req.url));
    return NextResponse.next();
  }

  // ── Authenticated non-admin ───────────────────────────────────────────────

  // Redirect away from login/root once authenticated.
  if (pathname === `${BASE}/login` || pathname === BASE) {
    const dest = isActive ? `${BASE}/today` : PENDING_PAGE;
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // Non-ACTIVE users may only reach public routes or the pending-approval page.
  // This catches accountStatus === "PENDING", "SUSPENDED", or undefined.
  if (!isActive) {
    if (isPublic || pathname === PENDING_PAGE) return NextResponse.next();
    return NextResponse.redirect(new URL(PENDING_PAGE, req.url));
  }

  // Active non-admin: no need to stay on the waiting room.
  if (pathname === PENDING_PAGE) {
    return NextResponse.redirect(new URL(`${BASE}/today`, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
