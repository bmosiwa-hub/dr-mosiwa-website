import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const BASE = "/astelpo_26";
const PUBLIC = [
  `${BASE}/login`,
  `${BASE}/forgot-password`,
  `${BASE}/join`,
  `${BASE}/view`,
  `${BASE}/api/approve-viewer`,
];

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith(BASE)) return NextResponse.next();

  const isPublic = PUBLIC.some((p) => pathname.startsWith(p));
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL(`${BASE}/login`, req.url));
  }
  if (isLoggedIn && pathname === `${BASE}/login`) {
    return NextResponse.redirect(new URL(`${BASE}/today`, req.url));
  }
  if (isLoggedIn && pathname === BASE) {
    return NextResponse.redirect(new URL(`${BASE}/today`, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
