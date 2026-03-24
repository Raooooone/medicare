"use client";

import { useState } from "react";
import { updateMedecinProfile } from "@/app/actions/medecin";
import { useRouter } from "next/navigation";

export default function ProfilForm({ user }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState(""); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(e.target);
    const res = await updateMedecinProfile(formData);

    if (res.success) {
      setMessage("✅ Vos informations ont été mises à jour avec succès !");
      router.refresh();
      setFileName(""); 
    } else {
      setMessage("❌ " + res.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
      
      {/* Message de notification */}
      {message && (
        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      {/* Upload Image Stylisé */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Photo de profil professionnelle</label>
        <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-cyan-300 rounded-xl p-6 bg-cyan-50/50 hover:bg-cyan-50 transition-colors cursor-pointer overflow-hidden">
          <input 
            type="file" 
            name="image" 
            accept="image/*" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) setFileName(file.name);
            }}
          />
          <div className="flex flex-col items-center text-center pointer-events-none">
            {fileName ? (
              <>
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span className="text-sm font-bold text-cyan-800">{fileName}</span>
                <span className="text-xs text-gray-500 mt-1">Cliquez pour modifier</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                </div>
                <span className="text-sm font-bold text-cyan-700">Mettre à jour la photo</span>
                <span className="text-xs text-gray-500 mt-1">Formats JPG ou PNG acceptés</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Champ Nom */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nom du Praticien</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <input
              type="text"
              name="name"
              defaultValue={user.name}
              required
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all font-medium text-gray-800"
            />
          </div>
        </div>

        {/* Champ Téléphone */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Cabinet</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            </div>
            <input
              type="text"
              name="phone"
              defaultValue={user.contact || ""}
              placeholder="Ex: +216 71 123 456"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all font-medium text-gray-800"
            />
          </div>
        </div>
      </div>

      {/* Champ Horaires */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Jours et Heures de consultation
        </label>
        <textarea
          name="workingHours"
          defaultValue={user.workingHours || ""}
          placeholder="Ex: Lundi au Vendredi : 08h00 - 16h00&#10;Samedi : Urgences uniquement"
          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all font-medium text-gray-800 h-28 resize-none"
        />
      </div>

      {/* Bouton de validation */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:from-cyan-500 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/30 transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Enregistrement en cours...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
            Enregistrer les modifications
          </>
        )}
      </button>

    </form>
  );
}