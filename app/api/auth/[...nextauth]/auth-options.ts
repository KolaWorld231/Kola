import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        console.log("[NEXTAUTH] authorize() called with:", { 
          credentialsKeys: credentials ? Object.keys(credentials) : null,
          credentialsType: typeof credentials,
          reqExists: !!req,
        });

        try {
          console.log("[NEXTAUTH] Authorization attempt:", { 
            email: credentials?.email,
            credentialsKeys: credentials ? Object.keys(credentials) : null,
            credentialsType: typeof credentials,
            credentialsValue: JSON.stringify(credentials)
          });
          
          if (!credentials?.email || !credentials?.password) {
            console.log("[NEXTAUTH] Missing credentials - email:", credentials?.email, "password:", credentials?.password ? "present" : "missing");
            return null;
          }

          const normalizedEmail = credentials.email.toLowerCase().trim();
          console.log("[NEXTAUTH] Looking up user:", normalizedEmail);

          try {
            const dbList = await prisma.$queryRawUnsafe('PRAGMA database_list;');
            console.log('[NEXTAUTH] PRAGMA database_list:', dbList);
          } catch (e) {
            console.log('[NEXTAUTH] PRAGMA database_list error:', e);
          }

          const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          });

          if (!user) {
            console.log("[NEXTAUTH] User not found:", normalizedEmail);
            return null;
          }

          if (!user.password) {
            console.log("[NEXTAUTH] User has no password (OAuth user)");
            return null;
          }

          console.log("[NEXTAUTH] Comparing password...");
          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log("[NEXTAUTH] Invalid password");
            return null;
          }

          console.log("[NEXTAUTH] Authorization successful:", user.id);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("[NEXTAUTH] Authorization error:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    updateAge: 24 * 60 * 60, // 24 hours - session updates daily
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
  events: {
    async signIn({ user, account: _account, profile: _profile }) {
      console.log("[NEXTAUTH] Sign in event:", { userId: user.id, email: user.email });
    },
    async signOut({ token, session }) {
      // Log sign out for debugging
      console.log("[NEXTAUTH] Sign out event:", { 
        userId: token?.id || session?.user?.id,
        email: session?.user?.email 
      });
      // With JWT strategy, the token is cleared client-side
      // No server-side cleanup needed for JWT sessions
    },
  },
};

