import { auth } from "@/auth";
import { NextResponse } from "next/server";

const BASE = "/astelpo_26";
const publicPaths = [`${BASE}/login`, `${BASE}/forgot-password`];

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Only protect AstelPO routes
  if (!pathname.startsWith(BASE)) {
    return NextResponse.next();
  }

  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL(`${BASE}/login`, nextUrl.origin));
  }

  if (isLoggedIn && pathname === `${BASE}/login`) {
    return NextResponse.redirect(new URL(`${BASE}/today`, nextUrl.origin));
  }

  if (isLoggedIn && pathname === BASE) {
    return NextResponse.redirect(new URL(`${BASE}/today`, nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
