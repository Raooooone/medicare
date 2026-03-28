"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "../../actions/auth";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState("PATIENT");
  const [fileName, setFileName] = useState("");
  
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
    if (e.preventDefault) e.preventDefault();
    
    setLoading(true);
    setError("");

    const formData = new FormData(document.getElementById("register-form"));
    const email = formData.get("email");
    const password = formData.get("password");

    const res = await registerUser(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
      if (res.error.includes("spécialité")) setStep(1);
      else setStep(0); 
    } else {
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        router.push("/auth/login");
      } else {
        if (selectedRole === "ADMIN") router.push("/admin");
        else if (selectedRole === "MEDECIN") router.push("/medecin");
        else router.push("/patient");
        router.refresh();
      }
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

        <form id="register-form" onSubmit={handleNextStep} encType="multipart/form-data" className="flex flex-col gap-4">
          
          <div className={step === 0 ? "flex flex-col gap-4 animate-in fade-in slide-in-from-right-4" : "hidden"}>
            <input type="text" name="name" placeholder="Nom complet" required={step===0} className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="email" name="email" placeholder="Adresse Email" required={step===0} className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="password" name="password" placeholder="Mot de passe" required={step===0} minLength="6" className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />

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
              <input type="password" name="adminCode" placeholder="Code secret Admin" className="border-2 border-red-200 p-2 rounded bg-red-50 outline-none" />
            )}
          </div>

          <div className={selectedRole === "MEDECIN" && step === 1 ? "flex flex-col gap-4 animate-in fade-in slide-in-from-right-4" : "hidden"}>
            <label className="font-medium text-gray-700">Quelle est votre spécialité ?</label>
            <input type="text" name="specialite" placeholder="Ex: Cardiologue, Généraliste..." className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div className={selectedRole === "MEDECIN" && step === 2 ? "flex flex-col gap-4 animate-in fade-in" : "hidden"}>
            <label className="font-medium text-gray-700">Photo de profil</label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors relative">
              <input 
                type="file" 
                name="image" 
                accept="image/*" 
                className="hidden" 
                id="file-upload"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setFileName(file.name);
                }}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center w-full">
                {fileName ? (
                  <>
                    <svg className="w-10 h-10 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="text-sm font-semibold text-green-700 text-center break-all">{fileName}</span>
                    <span className="text-xs text-gray-500 mt-1 hover:underline">Changer de photo</span>
                  </>
                ) : (
                  <>
                    <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm text-gray-600">Cliquez pour choisir une photo</span>
                  </>
                )}
              </label>
            </div>
            <p className="text-xs text-gray-500 italic">Formats acceptés : JPG, PNG (Max 2Mo)</p>
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="py-3 rounded-lg font-bold text-white mt-4 transition-all bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
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