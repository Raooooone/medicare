"use client";
import { useState } from "react";
import { bookAppointment } from "../actions/patient";
export default function BookingForm({ doctors }) {
  const [loading, setLoading] = useState(false);

  async function handleBooking(formData) {
    setLoading(true);
    const doctorId = formData.get("doctorId");
    const date = formData.get("date");

    try {
      await bookAppointment(doctorId, date);
      alert("Demande de rendez-vous envoyée au médecin !");
    } catch (error) {
      alert("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleBooking} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Choisissez un médecin</label>
        <select name="doctorId" required className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500">
          <option value="">Sélectionnez une spécialité / médecin...</option>
          {doctors.map(doc => (
            <option key={doc.id} value={doc.id}>
              Dr. {doc.name} - {doc.specialite || "Généraliste"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date et Heure</label>
        <input 
          type="datetime-local" 
          name="date" 
          required 
          className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 disabled:bg-blue-300 transition"
      >
        {loading ? "Envoi en cours..." : "Confirmer la demande"}
      </button>
    </form>
  );
}