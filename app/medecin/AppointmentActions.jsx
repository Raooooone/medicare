"use client";
import { useState } from "react";
import { updateAppointmentStatus, addConsultationNote } from "@/app/actions/medecin";

export default function AppointmentActions({ appointmentId, currentStatus, initialNote }) {
  const [note, setNote] = useState(initialNote || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false); // Permet d'afficher/masquer la zone de texte

  const handleStatusChange = async (status) => {
    await updateAppointmentStatus(appointmentId, status);
  };

  const handleSaveNote = async () => {
    setIsSaving(true);
    const res = await addConsultationNote(appointmentId, note);
    setIsSaving(false);
    
    if (res.success) {
      alert("Compte-rendu enregistré avec succès ! Le patient peut maintenant le lire.");
      setShowNoteForm(false);
    } else {
      alert(res.error || "Une erreur est survenue lors de l'enregistrement.");
    }
  };

  // 1. SI LE RDV EST EN ATTENTE (PENDING) -> On affiche les boutons Confirmer/Annuler
  if (currentStatus === "PENDING") {
    return (
      <div className="flex gap-2">
        <button 
          onClick={() => handleStatusChange("CONFIRMED")}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm transition font-bold"
        >
          Confirmer
        </button>
        <button 
          onClick={() => handleStatusChange("CANCELLED")}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm transition font-bold"
        >
          Annuler
        </button>
      </div>
    );
  }

  // 2. SI LE RDV EST ANNULÉ -> On affiche juste un badge
  if (currentStatus === "CANCELLED") {
    return <span className="text-red-600 font-bold bg-red-100 px-3 py-1 rounded">Annulé</span>;
  }

  // 3. SI LE RDV EST CONFIRMÉ -> On affiche le badge ET la gestion des notes
  return (
    <div className="flex flex-col gap-3 min-w-[280px]">
      <div className="flex justify-between items-center">
         <span className="text-green-600 font-bold bg-green-100 px-3 py-1 rounded text-sm">Confirmé</span>
         
         {/* Bouton pour ouvrir la zone de texte */}
         <button 
            onClick={() => setShowNoteForm(!showNoteForm)}
            className="text-blue-600 text-xs font-bold hover:underline"
         >
            {initialNote || note ? "✏️ Modifier la note" : "➕ Ajouter une note"}
         </button>
      </div>

      {/* Zone qui s'affiche soit quand on clique sur le bouton, soit si une note existe déjà */}
      {(showNoteForm || (initialNote && !showNoteForm)) && (
        <div className="flex flex-col gap-2 mt-2 bg-blue-50 p-3 rounded-lg border border-blue-100 shadow-sm">
          <label className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            Compte-rendu médical
          </label>
          
          {showNoteForm ? (
            <>
              {/* Le formulaire de saisie */}
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tapez le diagnostic, les prescriptions, etc."
                className="w-full p-2 text-sm border border-blue-200 rounded outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              ></textarea>
              <div className="flex gap-3 justify-end mt-1">
                <button 
                  onClick={() => setShowNoteForm(false)}
                  className="text-gray-500 text-xs hover:text-gray-800 font-medium transition"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSaveNote}
                  disabled={isSaving}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-blue-700 disabled:bg-blue-300 transition"
                >
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </>
          ) : (
            /* L'affichage en mode lecture seule */
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-white p-2 rounded border border-blue-100">
              {note || initialNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}