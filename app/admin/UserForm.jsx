"use client";
import { useState } from "react";
import { createUser } from "../actions/admin";
export default function UserForm() {
  const [role, setRole] = useState("PATIENT");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    try {
      const res = await createUser(formData);
      if (res.success) {
        alert("Utilisateur créé avec succès !");
        e.target.reset(); // Vide le formulaire
      }
    } catch (error) {
      alert("Erreur lors de la création : " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input type="text" name="name" placeholder="Nom complet" required className="border p-2 rounded" />
      <input type="email" name="email" placeholder="Adresse Email" required className="border p-2 rounded" />
      <input type="password" name="password" placeholder="Mot de passe" required className="border p-2 rounded" />
      
      <select name="role" value={role} onChange={(e) => setRole(e.target.value)} className="border p-2 rounded">
        <option value="PATIENT">Patient</option>
        <option value="MEDECIN">Médecin</option>
      </select>

      {/* Affiche la spécialité uniquement si le rôle est Médecin */}
      {role === "MEDECIN" && (
        <input type="text" name="specialite" placeholder="Spécialité (ex: Pédiatre)" required className="border p-2 rounded" />
      )}
      
      {/* Affiche l'âge et la maladie si le rôle est Patient */}
      {role === "PATIENT" && (
        <div className="flex gap-2">
          <input type="number" name="age" placeholder="Âge" className="border p-2 rounded w-1/3" />
          <input type="text" name="maladie" placeholder="Maladie / Antécédents" className="border p-2 rounded w-2/3" />
        </div>
      )}

      <button type="submit" disabled={loading} className="bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700 disabled:bg-blue-300">
        {loading ? "Création..." : "Enregistrer l'utilisateur"}
      </button>
    </form>
  );
}