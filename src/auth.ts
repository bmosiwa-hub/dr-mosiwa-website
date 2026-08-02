import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user || !user.password) return null;

        const passwordValid = await bcrypt.compare(parsed.data.password, user.password);
        if (!passwordValid) return null;

        if (user.accountStatus === "SUSPENDED") return null;

        // Auto-link any pending editor memberships for this email
        await db.projectMember.updateMany({
          where: { email: user.email, status: "PENDING", role: "EDITOR" },
          data: { userId: user.id, status: "ACTIVE" },
        });

        // Only return id — role and accountStatus are read from DB in the jwt callback
        // so that approval/suspension takes effect immediately without re-login.
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Initial sign-in: user object is from authorize()
        token.id = user.id;
      }
      // Always re-read role and accountStatus from DB so changes take effect immediately.
      // This runs on every JWT access (every request in JWT strategy).
      if (token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, accountStatus: true },
        });
        if (!dbUser) {
          // User was deleted — invalidate the token
          return {} as typeof token;
        }
        token.role = dbUser.role;
        token.accountStatus = dbUser.accountStatus;
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
});
