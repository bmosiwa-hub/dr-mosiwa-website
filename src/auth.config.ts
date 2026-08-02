import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/astelpo_26/login",
    error: "/astelpo_26/login",
  },
  session: { strategy: "jwt" as const, maxAge: 30 * 60, updateAge: 60 },
  providers: [],
} satisfies NextAuthConfig;
