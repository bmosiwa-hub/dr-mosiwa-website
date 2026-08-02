import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { google } from "googleapis";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.azariahmosiwa.com";
const REDIRECT_URI = `${BASE_URL}/astelpo_26/api/google-calendar/callback`;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(`${BASE_URL}/astelpo_26/login`);
  }

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );

  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    state: session.user.id,
  });

  return NextResponse.redirect(url);
}
