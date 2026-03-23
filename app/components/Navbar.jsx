import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

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
            {/* Zone Profil Cliquable pour le Médecin */}
            <div className="hidden sm:flex items-center gap-3 border-r pr-4 border-gray-200">
              <div className="text-right">
                {session.user.role === "MEDECIN" ? (
                  <Link 
                    href="/medecin/profil" 
                    className="text-sm font-bold text-gray-800 hover:text-blue-600 transition-colors block"
                    title="Voir mon profil"
                  >
                    {session.user.name}
                  </Link>
                ) : (
                  <p className="text-sm font-bold text-gray-800">{session.user.name}</p>
                )}
                <p className="text-[10px] uppercase tracking-wider text-blue-500 font-black">
                  {session.user.role}
                </p>
              </div>
              
              {/* Avatar ou Initiale */}
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-200">
                {session.user.name.charAt(0).toUpperCase()}
              </div>
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