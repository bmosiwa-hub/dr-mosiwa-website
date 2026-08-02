import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/astelpo_26/login",
    error: "/astelpo_26/login",
  },
  session: { strategy: "jwt" as const, maxAge: 30 * 60 },
  callbacks: {
    // Runs in both the middleware (lightweight auth instance) and the full auth instance.
    // Without this, req.auth.user in middleware only has standard fields (name/email/image)
    // and accountStatus/role are invisible — causing all users to appear non-ACTIVE.
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { accountStatus?: string }).accountStatus = token.accountStatus as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
