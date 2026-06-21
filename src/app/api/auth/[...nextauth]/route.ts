import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@/lib/db/prisma";
import nodemailer from "nodemailer";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      async sendVerificationRequest({ identifier: email, url }) {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        const info = await transporter.sendMail({
          from: '"Package Tracker" <noreply@packagetracker.dev>',
          to: email,
          subject: "Sign in to Package Tracker",
          text: `Sign in here: ${url}`,
          html: `<a href="${url}">Click here to sign in</a>`,
        });

        console.log("Magic link preview:", nodemailer.getTestMessageUrl(info));
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
