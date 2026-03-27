import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import BookingForm from "./BookingForm";

export const dynamic = 'force-dynamic';

export default async function PatientPage() {
  const session = await getServerSession(authOptions);

  // 1. Récupération de l'historique des rendez-vous
  const myAppointments = await prisma.appointment.findMany({
    where: { patientId: session.user.id },
    include: { doctor: { select: { name: true, specialite: true } } },
    orderBy: { date: 'desc' }
  });

  // 2. Liste des médecins
  const availableDoctors = await prisma.user.findMany({
    where: { role: "MEDECIN" },
    select: { id: true, name: true, specialite: true }
  });

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLONNE GAUCHE : HISTORIQUE */}
        <div className="lg:col-span-7">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-600 rounded-xl shadow-blue-200 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mes Rendez-vous</h1>
          </div>
          
          <div className="space-y-4">
            {myAppointments.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-20 text-center">
                <p className="text-gray-400 font-medium text-lg">Aucun historique de consultation.</p>
              </div>
            ) : (
              myAppointments.map(appt => (
                <div key={appt.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex transition-all hover:shadow-md">
                  
                  {/* Indicateur de statut latéral */}
                  <div className={`w-2 ${
                    appt.status === 'CONFIRME' ? 'bg-emerald-500' : 
                    appt.status === 'ANNULE' ? 'bg-rose-500' : 'bg-amber-400'
                  }`} />

                  <div className="p-6 flex-1">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Dr. {appt.doctor.name}</h3>
                        <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mt-1">
                          {appt.doctor.specialite || "Généraliste"}
                        </p>
                        
                        <div className="mt-4 flex items-center gap-4 text-sm font-semibold text-gray-500">
                          <span className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                            {new Date(appt.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                          </span>
                          <span className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            {new Date(appt.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border-2 ${
                          appt.status === 'CONFIRME' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          appt.status === 'ANNULE' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {appt.status === 'CONFIRME' ? '● Validé' : appt.status === 'ANNULE' ? '● Refusé' : '● En attente'}
                        </span>
                      </div>
                    </div>

                    {/* Zone de Notes / Compte-rendu */}
                    {appt.notes && (
                      <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-2 italic">
                          Compte-rendu du médecin :
                        </span>
                        <p className="text-sm text-gray-700 leading-relaxed font-medium">
                          {appt.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLONNE DROITE : BOOKING */}
        <div className="lg:col-span-5">
          <div className="sticky top-10">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 p-8 border border-gray-100 relative overflow-hidden">
              {/* Décoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16" />
              
              <h2 className="text-2xl font-black text-gray-900 mb-2">Prendre RDV</h2>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Choisissez un créneau avec l'un de nos spécialistes. Une notification vous sera envoyée dès validation.
              </p>

              <BookingForm doctors={availableDoctors} />
            </div>
            
            {/* Petit Widget Info */}
            <div className="mt-6 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] text-white shadow-lg">
              <h4 className="font-bold mb-2 flex items-center gap-2 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/></svg>
                Support Médical 24/7
              </h4>
              <p className="text-[11px] opacity-80 leading-snug">
                Besoin d'aide pour une urgence ? Contactez-nous directement via le numéro vert de la clinique.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}