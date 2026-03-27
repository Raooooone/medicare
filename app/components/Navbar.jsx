import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";import LogoutButton from "./LogoutButton";
import { prisma } from "../../lib/prisma";
export const dynamic = "force-dynamic";

export default async function Navbar() {
  const session = await getServerSession(authOptions);
  
  let userImage = null;
  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true }
    });
    userImage = dbUser?.image;
  }

  // 👇 Définition dynamique du lien de profil selon le rôle
  const profileHref = session?.user?.role === "MEDECIN" 
    ? "/medecin/profile" 
    : "/patient/profile";

  return (
    <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-2xl font-bold text-blue-600 hover:opacity-80 transition">
          MediCare
        </Link>
        
        {session && (
          <ul className="flex gap-6 text-gray-600 text-sm font-medium">
            {session.user.role === "ADMIN" && (
              <li><Link href="/admin" className="hover:text-blue-600 transition">Tableau de bord</Link></li>
            )}
            {session.user.role === "MEDECIN" && (
              <li><Link href="/medecin" className="hover:text-blue-600 transition">Planning Patients</Link></li>
            )}
            {session.user.role === "PATIENT" && (
              <li><Link href="/patient" className="hover:text-blue-600 transition">Mes RDV</Link></li>
            )}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-4">
        {session ? (
          <div className="flex items-center gap-4 animate-in fade-in duration-500">
            {/* Zone Profil Cliquable (Médecin et Patient) */}
            <div className="hidden sm:flex items-center gap-3 border-r pr-4 border-gray-200">
              <div className="text-right">
                {/* Le nom devient un lien pour tout le monde (sauf Admin si tu n'as pas de page profil pour lui)
                */}
                <Link 
                  href={profileHref} 
                  className="text-sm font-bold text-gray-800 hover:text-blue-600 transition-colors block"
                  title="Voir mon profil"
                >
                  {session.user.name}
                </Link>
                <p className="text-[10px] uppercase tracking-wider text-blue-500 font-black">
                  {session.user.role}
                </p>
              </div>
              
              {/* Avatar cliquable vers le profil également */}
              <Link href={profileHref} className="hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border-2 border-blue-200 overflow-hidden shadow-sm">
                  {userImage ? (
                    <img 
                      src={userImage} 
                      alt={`Profil de ${session.user.name}`} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    session.user.name.charAt(0).toUpperCase()
                  )}
                </div>
              </Link>
            </div>
            
            <LogoutButton />
          </div>
        ) : (
          <Link 
            href="/auth/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md shadow-blue-200 transition-all active:scale-95"
          >
            Connexion
          </Link>
        )}
      </div>
    </nav>
  );
}