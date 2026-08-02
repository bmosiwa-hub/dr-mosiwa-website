"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { google } from "googleapis";
import { format } from "date-fns";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.azariahmosiwa.com";
const REDIRECT_URI = `${BASE_URL}/astelpo_26/api/google-calendar/callback`;

async function getOAuth2Client(userId: string) {
  const account = await db.account.findFirst({
    where: { userId, provider: "google-calendar" },
    select: { access_token: true, refresh_token: true, expires_at: true },
  });

  if (!account?.access_token) return null;

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );

  oauth2.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  // Auto-save refreshed tokens
  oauth2.on("tokens", async (tokens) => {
    await db.account.update({
      where: { provider_providerAccountId: { provider: "google-calendar", providerAccountId: userId } },
      data: {
        access_token: tokens.access_token ?? undefined,
        refresh_token: tokens.refresh_token ?? undefined,
        expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : undefined,
      },
    });
  });

  return oauth2;
}

function toRFC3339Date(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export async function disconnectGoogleCalendar(): Promise<{ success?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };
  const userId = session.user.id;

  await db.account.deleteMany({ where: { userId, provider: "google-calendar" } });
  return { success: "Google Calendar disconnected." };
}

export async function syncToGoogleCalendar(): Promise<{ success?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated." };
  const userId = session.user.id;

  const oauth2 = await getOAuth2Client(userId);
  if (!oauth2) return { error: "Google Calendar not connected. Please connect first." };

  const calendar = google.calendar({ version: "v3", auth: oauth2 });

  // Fetch tasks with due dates
  const [tasks, milestones] = await Promise.all([
    db.task.findMany({
      where: {
        project: { leadId: userId },
        dueDate: { not: null },
        status: { notIn: ["DONE", "CANCELLED"] },
      },
      select: {
        id: true, title: true, dueDate: true, priority: true, status: true,
        project: { select: { name: true } },
      },
    }),
    db.milestone.findMany({
      where: {
        project: { leadId: userId },
        targetDate: { not: null },
        status: { notIn: ["COMPLETED"] },
      },
      select: {
        id: true, name: true, targetDate: true, status: true,
        project: { select: { name: true } },
      },
    }),
  ]);

  let created = 0;
  let updated = 0;
  let failed = 0;

  // Search for existing AstelPO events to avoid duplicates
  async function findExistingEvent(astelpoId: string, type: string) {
    try {
      const res = await calendar.events.list({
        calendarId: "primary",
        privateExtendedProperty: [`astelpoId=${astelpoId}`, `astelpoType=${type}`],
        maxResults: 1,
      });
      return res.data.items?.[0] ?? null;
    } catch {
      return null;
    }
  }

  // Sync tasks
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const dateStr = toRFC3339Date(task.dueDate);
    const eventBody = {
      summary: `[Task] ${task.title}`,
      description: `Project: ${task.project.name}\nPriority: ${task.priority}\nStatus: ${task.status}\n\nManaged by AstelPO`,
      start: { date: dateStr },
      end: { date: dateStr },
      extendedProperties: {
        private: { astelpoId: task.id, astelpoType: "task" },
      },
      colorId: task.priority === "CRITICAL" ? "11" : task.priority === "HIGH" ? "6" : "9",
    };

    try {
      const existing = await findExistingEvent(task.id, "task");
      if (existing?.id) {
        await calendar.events.update({ calendarId: "primary", eventId: existing.id, requestBody: eventBody });
        updated++;
      } else {
        await calendar.events.insert({ calendarId: "primary", requestBody: eventBody });
        created++;
      }
    } catch {
      failed++;
    }
  }

  // Sync milestones
  for (const ms of milestones) {
    if (!ms.targetDate) continue;
    const dateStr = toRFC3339Date(ms.targetDate);
    const eventBody = {
      summary: `[Milestone] ${ms.name}`,
      description: `Project: ${ms.project.name}\nStatus: ${ms.status}\n\nManaged by AstelPO`,
      start: { date: dateStr },
      end: { date: dateStr },
      extendedProperties: {
        private: { astelpoId: ms.id, astelpoType: "milestone" },
      },
      colorId: "3",
    };

    try {
      const existing = await findExistingEvent(ms.id, "milestone");
      if (existing?.id) {
        await calendar.events.update({ calendarId: "primary", eventId: existing.id, requestBody: eventBody });
        updated++;
      } else {
        await calendar.events.insert({ calendarId: "primary", requestBody: eventBody });
        created++;
      }
    } catch {
      failed++;
    }
  }

  const total = created + updated;
  if (failed > 0 && total === 0) return { error: `Sync failed for all ${failed} items. Check your Google credentials.` };

  const parts: string[] = [];
  if (created > 0) parts.push(`${created} created`);
  if (updated > 0) parts.push(`${updated} updated`);
  if (failed > 0) parts.push(`${failed} failed`);

  return { success: `Synced to Google Calendar: ${parts.join(", ")}.` };
}
