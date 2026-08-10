import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.azariahmosiwa.com";
const REDIRECT_URI =
  process.env.GOOGLE_CALENDAR_REDIRECT_URI ??
  `${BASE_URL}/astelpo_26/api/google-calendar/callback`;
const CALENDAR_PAGE = `${BASE_URL}/astelpo_26/calendar`;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(`${BASE_URL}/astelpo_26/login`);
  }

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code || state !== session.user.id) {
    return NextResponse.redirect(`${CALENDAR_PAGE}?error=google_auth_failed`);
  }

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );

  let tokens;
  try {
    const resp = await oauth2.getToken(code);
    tokens = resp.tokens;
  } catch (err: unknown) {
    const msg = err instanceof Error ? encodeURIComponent(err.message.slice(0, 200)) : "unknown";
    return NextResponse.redirect(`${CALENDAR_PAGE}?error=token_exchange_failed&detail=${msg}`);
  }

  if (!tokens.access_token) {
    return NextResponse.redirect(`${CALENDAR_PAGE}?error=no_access_token`);
  }

  await db.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "google-calendar",
        providerAccountId: session.user.id,
      },
    },
    create: {
      userId: session.user.id,
      type: "oauth",
      provider: "google-calendar",
      providerAccountId: session.user.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? null,
      expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : null,
      scope: tokens.scope ?? null,
      token_type: tokens.token_type ?? null,
    },
    update: {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? undefined,
      expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : null,
      scope: tokens.scope ?? null,
    },
  });

  return NextResponse.redirect(`${CALENDAR_PAGE}?connected=true`);
}
