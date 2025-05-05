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
      const allowedEmail = process.env.ALLOWED_EMAIL;
      
      console.log('Sign-in attempt:', { userEmail: user.email, allowedEmail });
      
      if (allowedEmail && user.email === allowedEmail) {
        console.log('Sign-in successful: Email matched allowed email');
        return true;
      }

      console.log('Sign-in rejected: Email did not match allowed email');
      return false;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

export default NextAuth(authOptions);
