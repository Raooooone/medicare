import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import AppointmentActions from "./AppointmentActions";

export const dynamic = 'force-dynamic';

export default async function MedecinPage() {
  const session = await getServerSession(authOptions);

  // SÉCURITÉ : Vérification de la session et du rôle
  if (!session || session.user.role !== "MEDECIN") {
    redirect("/auth/login");
  }

  // Récupération des infos complètes du médecin (pour afficher les horaires/contact mis à jour)
  const medecinInfo = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      specialite: true,
      workingHours: true,
      contact: true,
    }
  });

  const appointments = await prisma.appointment.findMany({
    where: { doctorId: session.user.id },
    include: { patient: true },
    orderBy: { date: 'asc' }
  });

  const pendingCount = appointments.filter(a => a.status === "PENDING").length;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* En-tête avec lien vers le profil */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Bonjour, 
            <Link href="/medecin/profil" className="text-blue-600 hover:underline ml-2">
              Dr. {medecinInfo.name}
            </Link>
          </h1>
          <p className="text-gray-500 mt-1">
            Spécialité : <span className="font-semibold">{medecinInfo.specialite}</span>
          </p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <p className="text-sm font-medium text-gray-500">Horaires actuels :</p>
          <p className="text-blue-600 font-bold">{medecinInfo.workingHours || "Non définis"}</p>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
          <p className="text-orange-600 text-sm font-bold uppercase">En attente</p>
          <p className="text-2xl font-black text-orange-700">{pendingCount}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-blue-600 text-sm font-bold uppercase">Total Rendez-vous</p>
          <p className="text-2xl font-black text-blue-700">{appointments.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <p className="text-green-600 text-sm font-bold uppercase">Contact Pro</p>
          <p className="text-lg font-bold text-green-700">{medecinInfo.contact || "À renseigner"}</p>
        </div>
      </div>

      {/* Liste des rendez-vous */}
      <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
          Gestion des demandes
        </h2>
        
        {appointments.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-5xl mb-4 text-gray-200">📅</div>
            <p className="text-gray-400 italic">Aucun rendez-vous planifié pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appt) => (
              <div key={appt.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 border rounded-2xl hover:bg-gray-50 transition-all border-gray-100 group">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xl text-gray-800 group-hover:text-blue-600 transition-colors">
                      {appt.patient.name}
                    </span>
                    <span className={`text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-wider ${
                      appt.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 
                      appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                    <span>👤 <span className="font-medium text-gray-700">{appt.patient.age || 'N/A'} ans</span></span>
                    <span>🩺 <span className="font-medium text-gray-700">{appt.patient.maladie || 'Non renseignée'}</span></span>
                  </div>
                  <div className="text-blue-600 font-bold flex items-center gap-2 bg-blue-50 w-fit px-3 py-1 rounded-lg">
                    <span>🕒</span>
                    {new Date(appt.date).toLocaleString('fr-FR', { 
                        dateStyle: 'medium', 
                        timeStyle: 'short' 
                    })}
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0 w-full md:w-auto">
                   <AppointmentActions appointmentId={appt.id} currentStatus={appt.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}