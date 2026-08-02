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

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL(`${BASE}/login`, req.url));
  }
  if (isLoggedIn && pathname === `${BASE}/login`) {
    return NextResponse.redirect(new URL(`${BASE}/today`, req.url));
  }
  if (isLoggedIn && pathname === BASE) {
    return NextResponse.redirect(new URL(`${BASE}/today`, req.url));
  }
  // Redirect pending (non-admin) users to the approval waiting room
  if (isLoggedIn && accountStatus === "PENDING" && userRole !== "ADMIN" && pathname !== PENDING_PAGE) {
    return NextResponse.redirect(new URL(PENDING_PAGE, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
