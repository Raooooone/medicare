"use client";

import { updateAppointmentStatus } from "../actions/admin";
import { Check, X, Ban, Loader2, Clock } from "lucide-react";
import { useState } from "react";

export default function AppointmentRow({ appointment }) {
  const [loading, setLoading] = useState(false);
  // Sécurisation de l'état initial pour éviter le crash au build
  const [localStatus, setLocalStatus] = useState(appointment?.status || "EN_ATTENTE");

  const handleUpdate = async (newStatus) => {
    setLoading(true);
    const res = await updateAppointmentStatus(appointment?.id, newStatus);
    
    if (res.success) {
      setLocalStatus(newStatus);
    } else {
      alert(res.error || "Une erreur est survenue");
    }
    setLoading(false);
  };

  const statusStyles = {
    EN_ATTENTE: "bg-amber-100 text-amber-900 border-amber-300",
    CONFIRME: "bg-emerald-100 text-emerald-900 border-emerald-300",
    ANNULE: "bg-rose-100 text-rose-900 border-rose-300",
  };

  // Sécurité pour le rendu : si appointment n'existe pas encore
  if (!appointment) return null;

  return (
    <tr className="hover:bg-blue-50/50 transition-colors duration-200 group border-b border-gray-100">
      {/* PATIENT - Sécurisé avec ?. */}
      <td className="p-4">
        <div className="font-bold text-gray-900 text-base">
          {appointment?.patient?.name || "Patient inconnu"}
        </div>
        <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Patient</div>
      </td>

      {/* MÉDECIN - Sécurisé avec ?. */}
      <td className="p-4">
        <div className="font-bold text-gray-900 text-base">
          Dr. {appointment?.doctor?.name || "Médecin"}
        </div>
        <div className="text-[10px] text-blue-600 font-black uppercase tracking-widest">
          {appointment?.doctor?.specialite || "Généraliste"}
        </div>
      </td>

      {/* DATE ET HEURE - Sécurisé */}
      <td className="p-4">
        <div className="text-sm font-bold text-gray-900">
          {appointment?.date 
            ? new Date(appointment.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
            : "Date non définie"}
        </div>
        <div className="text-xs font-bold text-gray-600 flex items-center gap-1">
           <Clock size={12} /> 
           {appointment?.date 
             ? `à ${new Date(appointment.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
             : "--:--"}
        </div>
      </td>

      {/* STATUT DYNAMIQUE */}
      <td className="p-4 text-center">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest border shadow-sm transition-all duration-300 ${statusStyles[localStatus]}`}>
          {loading && <Loader2 size={12} className="animate-spin" />}
          {localStatus === "ANNULE" ? "REFUSÉ" : 
           localStatus === "CONFIRME" ? "VALIDÉ" : "EN ATTENTE"}
        </span>
      </td>

      {/* ACTIONS */}
      <td className="p-4 text-right">
        {localStatus === "EN_ATTENTE" ? (
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => handleUpdate("CONFIRME")}
              disabled={loading}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all active:scale-90 shadow-md disabled:opacity-50"
            >
              <Check size={18} strokeWidth={3} />
            </button>
            <button 
              onClick={() => handleUpdate("ANNULE")}
              disabled={loading}
              className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all active:scale-90 shadow-md disabled:opacity-50"
            >
              <X size={18} strokeWidth={3} />
            </button>
          </div>
        ) : (
          <div className="flex justify-end items-center text-gray-900 text-[10px] font-black uppercase tracking-widest gap-1.5 animate-in fade-in slide-in-from-right-2">
             {localStatus === "ANNULE" ? (
               <><Ban size={14} className="text-rose-600"/> Demande Refusée</>
             ) : (
               <><Check size={14} className="text-emerald-600"/> Rendez-vous Confirmé</>
             )}
          </div>
        )}
      </td>
    </tr>
  );
}