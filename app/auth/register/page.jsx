"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/actions/auth";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("PATIENT");
  
  // Gestion des étapes pour le médecin (0: Infos de base, 1: Spécialité, 2: Image)
  const [step, setStep] = useState(0);

  const handleNextStep = (e) => {
    e.preventDefault();
    if (selectedRole === "MEDECIN" && step < 2) {
      setStep(step + 1);
    } else {
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    // Si c'est un événement de formulaire, on empêche le refresh
    if (e.preventDefault) e.preventDefault();
    
    setLoading(true);
    setError("");

    const formData = new FormData(document.getElementById("register-form"));
    const res = await registerUser(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
      setStep(0); // Retour au début en cas d'erreur
    } else {
      router.push("/auth/login?registered=true");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">Créer un compte</h1>
        <p className="text-gray-500 text-center mb-6 text-sm">Étape {selectedRole === "MEDECIN" ? step + 1 : 1} sur {selectedRole === "MEDECIN" ? 3 : 1}</p>

        {error && (
          <p className="text-red-500 text-center mb-4 text-sm bg-red-50 p-2 border border-red-200 rounded">{error}</p>
        )}

        <form id="register-form" onSubmit={handleNextStep} className="flex flex-col gap-4">
          
          {/* ÉTAPE 0 : INFOS DE BASE */}
          <div className={step === 0 ? "flex flex-col gap-4" : "hidden"}>
            <input type="text" name="name" placeholder="Nom complet" required className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="email" name="email" placeholder="Adresse Email" required className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="password" name="password" placeholder="Mot de passe" required minLength="6" className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />

            <div className="flex flex-col gap-1 mt-2">
              <label className="text-sm font-medium text-gray-700">Je suis un :</label>
              <div className="grid grid-cols-3 gap-2">
                {["PATIENT", "MEDECIN", "ADMIN"].map((role) => (
                  <label key={role} className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-all ${selectedRole === role ? "border-blue-600 bg-blue-50" : "hover:bg-gray-50"}`}>
                    <input type="radio" name="role" value={role} className="hidden" onChange={() => setSelectedRole(role)} checked={selectedRole === role} />
                    <span className="text-xs font-semibold">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedRole === "ADMIN" && (
              <input type="password" name="adminCode" placeholder="Code secret Admin" required className="border-2 border-red-200 p-2 rounded bg-red-50 outline-none" />
            )}
          </div>

          {/* ÉTAPE 1 : SPÉCIALITÉ (Uniquement Médecin) */}
          {selectedRole === "MEDECIN" && step === 1 && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
              <label className="font-medium text-gray-700">Quelle est votre spécialité ?</label>
              <input type="text" name="specialite" placeholder="Ex: Cardiologue, Généraliste..." required className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          )}

          {/* ÉTAPE 2 : IMAGE (Uniquement Médecin) */}
          {selectedRole === "MEDECIN" && step === 2 && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
              <label className="font-medium text-gray-700">Lien de votre photo de profil</label>
              <input type="text" name="image" placeholder="https://lien-de-votre-photo.com" required className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              <p className="text-xs text-gray-500 italic">Note: Utilisez une URL d'image valide.</p>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading} 
            className="py-3 rounded-lg font-bold text-white mt-4 transition-all bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Chargement..." : (selectedRole === "MEDECIN" && step < 2 ? "Continuer" : "S'inscrire")}
          </button>

          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} className="text-sm text-gray-500 hover:underline">Retour</button>
          )}
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Déjà un compte ? <Link href="/auth/login" className="text-blue-600 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}