import { prisma } from "../lib/prisma";
import DoctorDirectory from "./components/DoctorDirectory";
import Link from "next/link";
// 👇 Ajout de NextAuth pour vérifier si on est connecté
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
export const dynamic = "force-dynamic";

export default async function Home() {
  // 1. Récupération de la session utilisateur
  const session = await getServerSession(authOptions);

  // 2. Récupération de tous les médecins depuis PostgreSQL
  const doctors = await prisma.user.findMany({
    where: { role: "MEDECIN" },
    select: { id: true, name: true, specialite: true, image: true },
    orderBy: { name: 'asc' }
  });

  // 3. Définir le lien du tableau de bord selon le rôle
  let dashboardLink = "/patient";
  if (session?.user?.role === "ADMIN") dashboardLink = "/admin";
  if (session?.user?.role === "MEDECIN") dashboardLink = "/medecin";

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Section Hero (Bannière d'accueil) */}
      <section className="bg-blue-600 text-white py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            Trouvez le bon médecin et prenez rendez-vous
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            MediCare vous connecte avec les meilleurs spécialistes de santé. Filtrez par spécialité et planifiez votre consultation en quelques clics.
          </p>
          
          <div className="flex justify-center gap-4">
            {/* ✨ CONDITION : Si PAS connecté -> Afficher Login/Register ✨ */}
            {!session ? (
              <>
                <Link href="/auth/register" className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-50 transition-all">
                  Créer un compte
                </Link>
                <Link href="/auth/login" className="bg-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-800 border border-blue-500 transition-all">
                  Se connecter
                </Link>
              </>
            ) : (
              /* ✨ CONDITION : Si CONNECTÉ -> Afficher bouton vers l'espace personnel ✨ */
              <Link href={dashboardLink} className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-50 transition-all flex items-center gap-2">
                Aller à mon espace
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
              </Link>
            )}
          </div>
          
        </div>
      </section>

      {/* Section Annuaire des Médecins */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Nos Spécialistes</h2>
          <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>
        
        {/* On appelle notre composant client avec les données des médecins */}
        <DoctorDirectory doctors={doctors} />
      </section>

    </div>
  );
}