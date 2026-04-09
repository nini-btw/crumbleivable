/**
 * NextAuth configuration (MOCK VERSION)
 * @module infrastructure/auth/config
 * 
 * NOTE: This allows any login for UI development.
 * For production, enable proper credential checking.
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * NextAuth configuration - MOCK (allows any login)
 */
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // MOCK: Accept any credentials for UI development
        // In production, check against ADMIN_EMAIL and ADMIN_PASSWORD
        if (credentials?.email && credentials?.password) {
          return {
            id: "1",
            email: credentials.email as string,
            name: "Admin",
            role: "admin",
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
});
