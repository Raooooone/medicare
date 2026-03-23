"use client";

import { useState } from "react";
import { updateMedecinProfile } from "@/app/actions/medecin";
import { useRouter } from "next/navigation";

export default function ProfilForm({ user }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(e.target);
    const res = await updateMedecinProfile(formData);

    if (res.success) {
      setMessage("✅ Profil mis à jour avec succès !");
      router.refresh();
    } else {
      setMessage("❌ " + res.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-3 rounded-lg text-sm font-medium ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-600">URL de l'image de profil</label>
        <input
          type="text"
          name="image"
          defaultValue={user.image}
          placeholder="https://lien-de-votre-image.com"
          className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-600">Nom complet</label>
        <input
          type="text"
          name="name"
          defaultValue={user.name}
          required
          className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-600">Numéro de téléphone</label>
        <input
          type="text"
          name="phone"
          defaultValue={user.contact}
          placeholder="ex: +216 12 345 678"
          className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-600">Horaires de travail</label>
        <textarea
          name="workingHours"
          defaultValue={user.workingHours}
          placeholder="ex: Lun-Ven, 08:00 - 17:00"
          className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:bg-blue-300"
      >
        {loading ? "Mise à jour..." : "Enregistrer les modifications"}
      </button>
    </form>
  );
}