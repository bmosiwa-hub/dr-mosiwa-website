import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BASE = "/astelpo_26";
const PUBLIC = [`${BASE}/login`, `${BASE}/forgot-password`];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith(BASE)) return NextResponse.next();

  const isPublic = PUBLIC.some((p) => pathname.startsWith(p));
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL(`${BASE}/login`, req.url));
  }
  if (token && pathname === `${BASE}/login`) {
    return NextResponse.redirect(new URL(`${BASE}/today`, req.url));
  }
  if (token && pathname === BASE) {
    return NextResponse.redirect(new URL(`${BASE}/today`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
