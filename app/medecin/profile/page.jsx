import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfilForm from "./ProfilForm";

export default async function MedecinProfilPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "MEDECIN") {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8 flex justify-center">

      <div className="w-full max-w-4xl">

        {/* ===== Header ===== */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Espace Praticien</h1>
          <p className="text-gray-500 mt-2">
            Gérez votre profil et vos informations professionnelles
          </p>
        </div>

        {/* ===== Profil Card ===== */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          
          {/* COVER */}
          <div className="h-32 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          <div className="px-6 sm:px-12 pb-12 -mt-16">

            {/* Avatar + Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">

              <div className="relative">
                <img
                  src={user?.image || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png"}
                  alt="Profil"
                  className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-md object-cover"
                />
                <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
              </div>

              <div className="text-center sm:text-left flex-1">
                <h2 className="text-3xl font-extrabold text-gray-900">Dr. {user?.name || "Nom"}</h2>

                <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
                  {/* Spécialité */}
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded-full text-xs shadow-sm">
                    {user?.specialite || "Spécialité"}
                  </span>
                  {/* Statut */}
                  <span className="px-3 py-1.5 bg-green-50 text-green-600 font-semibold rounded-full text-xs shadow-sm">
                    ✔ Actif
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-200 my-8"></div>

            {/* Form */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
              <ProfilForm user={user} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}