"use client";
import { updateAppointmentStatus } from "../actions/admin";
import { Check, X, MoreVertical, Ban } from "lucide-react"; // Ajout de Ban pour l'icône
import { useState } from "react";

export default function AppointmentRow({ appointment }) {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (status) => {
    setLoading(true);
    await updateAppointmentStatus(appointment.id, status);
    setLoading(false);
  };

  // Couleurs des badges de statut
  const statusColors = {
    EN_ATTENTE: "bg-amber-100 text-amber-800 border-amber-200",
    CONFIRME: "bg-emerald-100 text-emerald-800 border-emerald-200",
    ANNULE: "bg-rose-100 text-rose-800 border-rose-200", // Rouge clair pour l'annulation
  };

  return (
    <tr className="hover:bg-blue-50/50 transition-colors duration-200 group border-b border-gray-100">
      {/* NOM DU PATIENT */}
      <td className="p-4">
        <div className="font-bold text-gray-900">{appointment.patient.name}</div>
        <div className="text-xs text-gray-500 font-medium">Patient</div>
      </td>

      {/* NOM DU MEDECIN */}
      <td className="p-4">
        <div className="font-bold text-gray-900">Dr. {appointment.doctor.name}</div>
        <div className="text-xs text-blue-600 font-semibold uppercase tracking-tighter">
          {appointment.doctor.specialite || "Généraliste"}
        </div>
      </td>

      {/* DATE ET HEURE */}
      <td className="p-4">
        <div className="text-sm font-bold text-gray-800">
          {new Date(appointment.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <div className="text-xs font-semibold text-gray-600">
           à {new Date(appointment.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </td>

      {/* STATUT DU RENDEZ-VOUS */}
      <td className="p-4 text-center">
        <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest border ${statusColors[appointment.status]}`}>
          {/* Ici on change l'affichage du texte selon l'état */}
          {appointment.status === "ANNULE" ? "REFUSÉ" : appointment.status.replace("_", " ")}
        </span>
      </td>

      {/* ACTIONS (Boutons) */}
      <td className="p-4 text-right">
        {appointment.status === "EN_ATTENTE" ? (
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => handleUpdate("CONFIRME")}
              disabled={loading}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-md disabled:opacity-50"
              title="Confirmer"
            >
              <Check size={16} />
            </button>
            <button 
              onClick={() => handleUpdate("ANNULE")}
              disabled={loading}
              className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition shadow-md disabled:opacity-50"
              title="Refuser / Annuler"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex justify-end items-center text-gray-500 text-xs font-medium italic gap-1">
             {appointment.status === "ANNULE" ? (
               <><Ban size={14} className="text-rose-500"/> Demande Refusée</>
             ) : (
               <><Check size={14} className="text-emerald-500"/> Session Validée</>
             )}
          </div>
        )}
      </td>
    </tr>
  );
}