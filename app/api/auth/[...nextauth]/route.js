import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";

export const authOptions = {
  providers: [
    // --- 1. GOOGLE ---
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // --- 2. GITHUB ---
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),

    // --- 3. CREDENTIALS (Email/Password) ---
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.password) return null;

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        if (!isMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // Synchronisation de l'utilisateur OAuth avec la DB Supabase
    async signIn({ user, account }) {
      if (account.provider === "google" || account.provider === "github") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                name: user.name,
                email: user.email,
                role: "PATIENT", 
                image: user.image,
                // Mot de passe aléatoire pour les comptes OAuth
                password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), 
              },
            });
          }
          return true;
        } catch (error) {
          console.error("Erreur Sync OAuth:", error);
          return false;
        }
      }
      return true;
    },

    // Gestion du Token (Côté Serveur)
    async jwt({ token, user }) {
      // Lors de la première connexion
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      // Sécurité : Si l'ID est manquant (ex: refresh session OAuth), on le repêche en DB
      if (!token.id && token.email) {
         const dbUser = await prisma.user.findUnique({
            where: { email: token.email }
         });
         if (dbUser) {
           token.id = dbUser.id; 
           token.role = dbUser.role;
         }
      }
      return token;
    },
    
    // Gestion de la Session (Côté Client/React)
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role || "PATIENT";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };