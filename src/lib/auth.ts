import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/enums";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user || !user.password || !user.isActive) return null;
        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!passwordMatch) return null;
        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user?.email) return false;
        try {
          let dbUser = await prisma.user.findUnique({ where: { email: user.email } });

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
                role: "PATIENT",
                isActive: true,
              },
            });
            await prisma.patient.create({ data: { userId: dbUser.id } });
          } else {
            if (!dbUser.isActive) return false;
            if (dbUser.role === "PATIENT") {
              await prisma.patient.upsert({
                where: { userId: dbUser.id },
                create: { userId: dbUser.id },
                update: {},
              });
            }
          }
        } catch {
          return false;
        }
        return true;
      }
      return !!user;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
          // Look up DB user by email since user.id is the Google OAuth sub
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { id: true, role: true, email: true },
          });
          token.id = dbUser?.id ?? user.id;
          token.role = dbUser?.role;
          token.email = dbUser?.email ?? user.email;
        } else {
          // Credentials: user.id is already the DB id
          token.id = user.id;
          token.role = (user as { role?: Role }).role;
          token.email = user.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        if (token.email) session.user.email = token.email;
      }
      return session;
    },
  },
});
