import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/astelpo_26/login",
    error: "/astelpo_26/login",
  },
  session: { strategy: "jwt" as const, maxAge: 30 * 60 },
  callbacks: {
    // Enforces inactivity timeout in middleware (no DB calls — edge-safe).
    // The full auth instance (auth.ts) writes lastActivity on every request;
    // this callback reads it and invalidates the token when 30 min has elapsed.
    jwt({ token }) {
      if (!token?.id) return token;
      const now = Math.floor(Date.now() / 1000);
      const lastActivity = token.lastActivity as number | undefined;
      if (lastActivity && now - lastActivity > 30 * 60) {
        return null;
      }
      return token;
    },
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
