import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  // Récupère le token JWT contenant le rôle de l'utilisateur
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // 1. Si l'utilisateur n'est pas connecté, on le force à se connecter
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // 2. Vérification stricte des rôles selon le dossier accédé
  if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
    // Un utilisateur non-admin tente d'accéder à /admin
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/medecin") && token.role !== "MEDECIN") {
    // Accès refusé pour ceux qui ne sont pas médecins
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/patient") && token.role !== "PATIENT") {
    // Accès refusé pour ceux qui ne sont pas patients
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // Si l'utilisateur a le bon rôle, on le laisse passer
  return NextResponse.next();
}

// Configuration : On indique au middleware d'écouter uniquement ces routes
export const config = {
  matcher: [
    "/admin/:path*", 
    "/medecin/:path*", 
    "/patient/:path*"
  ]
};