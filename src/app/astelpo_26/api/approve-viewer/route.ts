import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendViewerAccessGranted } from "@/lib/email";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.azariah.ca";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(`${BASE_URL}/astelpo_26/login`);

  const session = await db.viewerSession.findUnique({
    where: { token },
    include: { member: { include: { project: true } } },
  });

  if (!session) {
    return new NextResponse("Invalid or expired approval link.", { status: 400 });
  }

  if (session.approvedAt) {
    return new NextResponse("This access has already been approved.", { status: 200 });
  }

  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  await db.viewerSession.update({
    where: { id: session.id },
    data: { approvedAt: new Date(), expiresAt },
  });

  const viewLink = `${BASE_URL}/astelpo_26/view/${session.memberId}`;
  await sendViewerAccessGranted({
    email: session.requesterEmail,
    projectName: session.member.project.name,
    viewLink,
  });

  return new NextResponse(
    `<html><body style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
      <div style="text-align:center;max-width:400px;padding:2rem">
        <div style="font-size:3rem;margin-bottom:1rem">✅</div>
        <h1 style="color:#fff;margin-bottom:0.5rem">Access Approved</h1>
        <p style="color:#94a3b8">${session.requesterEmail} has been notified and can now view <strong style="color:#fff">${session.member.project.name}</strong> for 48 hours.</p>
      </div>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}
