import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
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

  // Récupération des infos complètes du médecin
  const medecinInfo = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      specialite: true,
      workingHours: true,
      contact: true,
      image: true,
    }
  });

  const appointments = await prisma.appointment.findMany({
    where: { doctorId: session.user.id },
    include: { patient: true },
    orderBy: { date: 'asc' }
  });

  const pendingCount = appointments.filter(a => a.status === "PENDING").length;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* =========================================
          EN-TÊTE DU TABLEAU DE BORD
          ========================================= */}
      <div className="relative bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-blue-900/5 overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Forme décorative en arrière-plan */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full -translate-y-1/2 translate-x-1/3 opacity-50 pointer-events-none"></div>
        
        <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
          {/* Avatar du médecin (ou initiale) */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 p-1 shrink-0 shadow-lg">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
              {medecinInfo.image ? (
                <img src={medecinInfo.image} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-blue-600">{medecinInfo.name.charAt(0)}</span>
              )}
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">
              Bonjour, <span className="text-blue-600">Dr. {medecinInfo.name}</span>
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold tracking-wide">
                🩺 {medecinInfo.specialite || "Généraliste"}
              </span>
              <Link href="/medecin/profile" className="text-sm font-semibold text-gray-500 hover:text-blue-600 underline underline-offset-4 transition-colors">
                Modifier mon profil
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl w-full md:w-auto relative z-10 text-center md:text-right flex flex-col justify-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Horaires de consultation</p>
          <p className="text-gray-800 font-bold flex items-center justify-center md:justify-end gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {medecinInfo.workingHours || "Non définis"}
          </p>
        </div>
      </div>

      {/* =========================================
          STATISTIQUES RAPIDES
          ========================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* En attente */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg shadow-orange-900/5 hover:-translate-y-1 transition-transform group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-600 text-xs font-black uppercase tracking-widest mb-1">À confirmer</p>
              <p className="text-4xl font-black text-gray-800">{pendingCount}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-2xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
          </div>
        </div>

        {/* Total RDV */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg shadow-blue-900/5 hover:-translate-y-1 transition-transform group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-600 text-xs font-black uppercase tracking-widest mb-1">Total RDV</p>
              <p className="text-4xl font-black text-gray-800">{appointments.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
          </div>
        </div>

        {/* Contact pro */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-lg shadow-green-900/5 hover:-translate-y-1 transition-transform group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-600 text-xs font-black uppercase tracking-widest mb-1">Téléphone Pro</p>
              <p className="text-2xl mt-2 font-bold text-gray-800">{medecinInfo.contact || "À renseigner"}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-2xl text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          GESTION DES RENDEZ-VOUS
          ========================================= */}
      <div className="bg-white shadow-xl shadow-gray-200/40 rounded-3xl p-6 sm:p-10 border border-gray-100">
        <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
          </div>
          Planning des consultations
        </h2>
        
        {appointments.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <div className="w-24 h-24 mb-4 text-blue-200">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <p className="text-xl font-bold text-gray-800">Aucun rendez-vous</p>
            <p className="text-gray-500 mt-2">Votre planning est vide pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {appointments.map((appt) => (
              <div key={appt.id} className="flex flex-col lg:flex-row justify-between lg:items-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                
                {/* Liseré de couleur selon le statut */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    appt.status === 'CONFIRMED' ? 'bg-green-500' : 
                    appt.status === 'PENDING' ? 'bg-orange-400' : 'bg-red-500'
                  }`}
                ></div>

                <div className="flex items-start sm:items-center gap-5 pl-2">
                  {/* Avatar Patient */}
                  <div className="hidden sm:flex w-14 h-14 bg-gray-100 text-gray-600 rounded-full items-center justify-center font-black text-xl border border-gray-200 shrink-0">
                    {appt.patient.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-extrabold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                        {appt.patient.name}
                      </span>
                      {/* Badge Statut */}
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        appt.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                        appt.status === 'CONFIRMED' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        {appt.status === 'CONFIRMED' ? '✅ Confirmé' : appt.status === 'PENDING' ? '⏳ En attente' : '❌ Annulé'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        <span className="font-semibold text-gray-800">{appt.patient.age || 'N/A'} ans</span>
                      </span>
                      <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                        <span className="font-semibold text-gray-800">{appt.patient.maladie || 'Motif non précisé'}</span>
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 text-blue-700 font-bold bg-blue-50/50 border border-blue-100 px-3 py-1.5 rounded-lg text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      {new Date(appt.date).toLocaleString('fr-FR', { 
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 lg:mt-0 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 pl-2 lg:pl-0">
                   {/* Actions (Confirmer, Annuler, Compte-rendu) */}
                   <AppointmentActions 
                     appointmentId={appt.id} 
                     currentStatus={appt.status} 
                     initialNote={appt.notes} 
                   />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}