import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { google } from "googleapis";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.azariahmosiwa.com";
const REDIRECT_URI =
  process.env.GOOGLE_CALENDAR_REDIRECT_URI ??
  `${BASE_URL}/astelpo_26/api/google-calendar/callback`;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    state: session.user.id,
    redirect_uri: REDIRECT_URI,
  });

  return NextResponse.json({
    clientIdPresent: !!clientId,
    clientIdPrefix: clientId?.slice(0, 20) + "…",
    redirectUri: REDIRECT_URI,
    nodeEnv: process.env.NODE_ENV,
    generatedUrl: url,
  });
}
