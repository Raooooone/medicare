import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import BookingForm from "./BookingForm";

export const dynamic = 'force-dynamic';

export default async function PatientPage() {
  const session = await getServerSession(authOptions);

  // 1. Récupération de l'historique des rendez-vous du patient
  const myAppointments = await prisma.appointment.findMany({
    where: { patientId: session.user.id },
    include: { doctor: true },
    orderBy: { date: 'desc' } // 'desc' pour afficher les plus récents en premier
  });

  // 2. Liste des médecins disponibles pour la prise de RDV
  const availableDoctors = await prisma.user.findMany({
    where: { role: "MEDECIN" },
    select: { id: true, name: true, specialite: true }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
      
      {/* =========================================
          COLONNE DE GAUCHE : MON HISTORIQUE (MES RDV)
          ========================================= */}
      <div className="lg:col-span-7">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center gap-3">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
          Mes Rendez-vous
        </h1>
        
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 min-h-[500px]">
          {myAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <p className="text-xl font-bold text-gray-700">Aucun rendez-vous</p>
              <p className="text-gray-500 mt-2">Vous n'avez pas encore consulté de médecin.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {myAppointments.map(appt => (
                <div key={appt.id} className="relative border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow bg-gray-50 overflow-hidden">
                  
                  {/* Bande de couleur latérale selon le statut */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    appt.status === 'CONFIRMED' ? 'bg-green-500' : 
                    appt.status === 'PENDING' ? 'bg-orange-400' : 
                    'bg-red-500'
                  }`}></div>

                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 ml-2">
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">
                        Dr. {appt.doctor.name}
                      </h3>
                      <p className="text-blue-600 font-medium text-sm mb-2">{appt.doctor.specialite || "Généraliste"}</p>
                      <p className="text-gray-600 font-medium flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {new Date(appt.date).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 border border-green-200' : 
                        appt.status === 'PENDING' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 
                        'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {appt.status === 'CONFIRMED' ? '✅ Confirmé' : appt.status === 'PENDING' ? '⏳ En attente' : '❌ Annulé'}
                      </span>
                    </div>
                  </div>

                  {/* Affichage des notes du médecin s'il y en a */}
                  {appt.notes && (
                    <div className="mt-5 ml-2 p-4 bg-white border border-blue-100 rounded-lg shadow-sm">
                      <p className="text-xs font-black text-blue-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Compte-rendu médical
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {appt.notes}
                      </p>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =========================================
          COLONNE DE DROITE : PRENDRE RENDEZ-VOUS
          ========================================= */}
      <div className="lg:col-span-5">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Nouveau Rendez-vous
        </h2>
        
        <div className="bg-white shadow-xl rounded-2xl p-6 border-t-4 border-blue-600 sticky top-24">
          <p className="text-sm text-gray-500 mb-6">
            Sélectionnez un spécialiste et choisissez la date et l'heure qui vous conviennent. Votre demande sera envoyée au médecin pour confirmation.
          </p>
          {/* Composant Client pour le formulaire */}
          <BookingForm doctors={availableDoctors} />
        </div>
      </div>

    </div>
  );
}