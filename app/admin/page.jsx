import { prisma } from "../../lib/prisma";
import AppointmentRow from "./AppointmentRow";
import { Calendar, CheckCircle, Clock, Stethoscope, BriefcaseMedical } from "lucide-react";

export default async function AdminDashboard() {
  const appointments = await prisma.appointment.findMany({
    include: {
      patient: { select: { name: true } },
      doctor: { select: { name: true, specialite: true } },
    },
    orderBy: { date: "desc" },
  });

  // 1. Calcul des statistiques globales
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === "EN_ATTENTE").length,
    confirmed: appointments.filter(a => a.status === "CONFIRME").length,
  };

  // 2. Groupement des rendez-vous par spécialité
  const groupedAppointments = appointments.reduce((acc, app) => {
    const spec = app.doctor.specialite || "Généraliste";
    if (!acc[spec]) acc[spec] = [];
    acc[spec].push(app);
    return acc;
  }, {});

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Gestion des Rendez-vous
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Vue organisée par spécialités médicales.</p>
        </header>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total" value={stats.total} icon={<Calendar className="text-blue-600" />} color="bg-blue-50" />
          <StatCard title="En attente" value={stats.pending} icon={<Clock className="text-amber-600" />} color="bg-amber-50" />
          <StatCard title="Confirmés" value={stats.confirmed} icon={<CheckCircle className="text-emerald-600" />} color="bg-emerald-50" />
        </div>

        {/* Sections par Spécialité */}
        <div className="space-y-12">
          {Object.entries(groupedAppointments).map(([specialite, list]) => (
            <section key={specialite}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200">
                  <Stethoscope size={20} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                  {specialite} 
                </h2>
                <span className="bg-blue-100 text-blue-700 text-xs font-black px-2.5 py-1 rounded-full border border-blue-200">
                  {list.length} RDV
                </span>
              </div>

              <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-500 text-[11px] font-black uppercase tracking-[0.2em]">
                        <th className="p-4">Patient</th>
                        <th className="p-4">Médecin</th>
                        <th className="p-4">Date & Heure</th>
                        <th className="p-4 text-center">Statut</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {list.map((app) => (
                        <AppointmentRow key={app.id} appointment={app} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          ))}

          {appointments.length === 0 && (
            <div className="p-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-bold text-lg">Aucun rendez-vous à afficher.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`${color} p-6 rounded-[2rem] flex items-center justify-between shadow-sm border border-white/50`}>
      <div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-gray-900">{value}</p>
      </div>
      <div className="p-4 bg-white rounded-2xl shadow-sm">{icon}</div>
    </div>
  );
}