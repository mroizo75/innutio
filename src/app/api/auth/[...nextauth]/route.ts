import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-post", type: "text", placeholder: "epost@example.com" },
        password: { label: "Passord", type: "password" },
      },
      async authorize(credentials) {
        const user = await db.user.findUnique({
          where: { email: credentials?.email },
          include: { bedrift: true },
        });

        if (!user) {
          throw new Error("Feil e-post eller passord");
        }

        const isValid = await bcrypt.compare(credentials!.password, user.password);

        if (!isValid) {
          throw new Error("Feil e-post eller passord");
        }

        if (!user.active) {
          throw new Error("Brukerkontoen er deaktivert");
        }

        return {
          id: user.id,
          email: user.email,
          navn: user.navn,
          etternavn: user.etternavn,
          role: user.role,
          bedriftId: user.bedriftId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.bedriftId = user.bedriftId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.bedriftId = token.bedriftId as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };