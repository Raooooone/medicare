import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"; // 👈 NOUVEAU
import GithubProvider from "next-auth/providers/github"; // 👈 NOUVEAU
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  providers: [
    // --- 1. CONNEXION PAR GOOGLE ---
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // --- 2. CONNEXION PAR GITHUB ---
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),

    // --- 3. CONNEXION CLASSIQUE (Email/Mot de passe) ---
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

        if (!user) return null;

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
    // Que se passe-t-il quand Google ou Github nous renvoie les infos de l'utilisateur ?
    async signIn({ user, account, profile }) {
      if (account.provider === "google" || account.provider === "github") {
        try {
          // On cherche si l'utilisateur existe déjà dans notre base de données
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          // S'il n'existe pas, on le crée silencieusement comme "PATIENT" par défaut !
          if (!existingUser) {
            await prisma.user.create({
              data: {
                name: user.name,
                email: user.email,
                role: "PATIENT", // Rôle par défaut
                image: user.image, // On récupère sa photo Google/Github
                // On met un mot de passe bidon car il se connecte via OAuth
                password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10), 
              },
            });
          }
          return true;
        } catch (error) {
          console.error("Erreur d'enregistrement OAuth:", error);
          return false;
        }
      }
      return true;
    },

    // Injecte les infos dans le token de session
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      
      // Si l'utilisateur s'est connecté via Google/Github, on s'assure de récupérer son rôle en base de données
      if (!token.role && token.email) {
         const dbUser = await prisma.user.findUnique({
            where: { email: token.email }
         });
         if (dbUser) token.role = dbUser.role;
      }
      
      return token;
    },
    
    // Transmet les infos au client (Navbar, Pages, etc.)
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role || "PATIENT";
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };