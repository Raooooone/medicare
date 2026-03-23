import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfilForm from "./ProfilForm"; // Composant client pour le formulaire

export default async function MedecinProfilPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MEDECIN") {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mon Profil Professionnel</h1>
      
      <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <div className="flex items-center gap-6 mb-8 pb-6 border-b">
          <img 
            src={user.image || "/default-avatar.png"} 
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-50"
            alt="Profil"
          />
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-blue-600 font-medium">{user.specialite}</p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-tighter italic">
              La spécialité ne peut pas être modifiée
            </p>
          </div>
        </div>

        <ProfilForm user={user} />
      </div>
    </div>
  );
}