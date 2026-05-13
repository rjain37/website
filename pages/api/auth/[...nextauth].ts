import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import { firestore } from "../../../lib/firebase/firebaseAdmin";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  adapter: FirestoreAdapter(firestore),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      // Add user's UID to the session
      if (token?.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async signIn({ user }) {
      const allowedEmails = (process.env.ALLOWED_EMAIL || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      console.log('Sign-in attempt:', { userEmail: user.email, allowedEmails });

      if (user.email && allowedEmails.includes(user.email.toLowerCase())) {
        console.log('Sign-in successful: Email matched allowed list');
        return true;
      }

      console.log('Sign-in rejected: Email not in allowed list');
      return false;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

export default NextAuth(authOptions);
