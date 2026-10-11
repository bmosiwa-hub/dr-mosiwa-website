import { db } from "@/lib/db";

/**
 * Access control for shared read-only project links.
 *
 * The invite flow already minted a 32-byte `inviteToken` with an expiry, then
 * emailed a link built from the member's id instead — so the secret was stored
 * and never checked, and the link was permanent and public to anyone it was
 * forwarded to. The token is now the path segment itself, which means every
 * page under /view is unreachable without it.
 *
 * A link is good only while the member is an ACTIVE VIEWER and the token has
 * not expired. Revoking a collaborator, or letting the window lapse, kills it.
 */

export type ViewerDenial = "invalid" | "expired" | "revoked";

export type ViewerAccess =
  | { ok: true; memberId: string; projectId: string; email: string }
  | { ok: false; reason: ViewerDenial };

export async function resolveViewerAccess(token: string): Promise<ViewerAccess> {
  if (!token || token.length < 32) return { ok: false, reason: "invalid" };

  const member = await db.projectMember.findUnique({
    where: { inviteToken: token },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      tokenExpiry: true,
      projectId: true,
    },
  });

  // An unknown token and a non-viewer token are the same answer on purpose:
  // never confirm that a given string means something.
  if (!member || member.role !== "VIEWER") return { ok: false, reason: "invalid" };
  if (member.status !== "ACTIVE") return { ok: false, reason: "revoked" };
  if (member.tokenExpiry && member.tokenExpiry.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, memberId: member.id, projectId: member.projectId, email: member.email };
}

export const VIEWER_DENIAL_COPY: Record<ViewerDenial, { title: string; message: string }> = {
  invalid: {
    title: "Not found",
    message: "This link is not valid.",
  },
  expired: {
    title: "Link expired",
    message: "This view link has expired. Ask the project owner to send a new one.",
  },
  revoked: {
    title: "Access withdrawn",
    message: "This link is no longer active. Ask the project owner if you still need access.",
  },
};

/**
 * Prisma filter for a usable view link. Pair it with `findFirst` — the extra
 * conditions mean this is no longer a lookup by unique key, which is the
 * point: an expired or revoked token must return nothing.
 */
export function viewerLinkWhere(token: string) {
  return {
    inviteToken: token,
    role: "VIEWER" as const,
    status: "ACTIVE" as const,
    OR: [{ tokenExpiry: null }, { tokenExpiry: { gt: new Date() } }],
  };
}
