"use client";
import { useSession } from "next-auth/react";

export default function PatientProfile() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      
      {/* En-tête de la page */}
      <div className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-800">Mon Profil Patient</h1>
      </div>
      
      {/* Carte de profil principale */}
      <div className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
        
        {/* "Photo de couverture" (Bandeau de couleur) */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

        <div className="px-6 sm:px-10 pb-10 flex flex-col sm:flex-row gap-8 relative">
          
          {/* Avatar (Superposé sur le bandeau grâce à -mt-16) */}
          <div className="shrink-0 -mt-16 flex justify-center sm:justify-start">
            <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-5xl font-bold overflow-hidden ring-4 ring-white shadow-lg">
              {user?.image ? (
                <img src={user.image} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* Informations de l'utilisateur */}
          <div className="flex-1 pt-2 text-center sm:text-left">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {user?.name || "Patient Inconnu"}
            </h2>
            <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mt-1 mb-6">
              Compte Patient
            </p>

            {/* Grille des informations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  Adresse Email
                </label>
                <p className="text-gray-800 font-medium break-all">{user?.email}</p>
              </div>

              {/* J'ai ajouté une case factice "Téléphone" pour équilibrer le design, vous pourrez la brancher à votre base de données plus tard ! */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  Téléphone
                </label>
                <p className="text-gray-400 italic font-medium">Non renseigné</p>
              </div>
            </div>

            {/* Bouton d'action */}
            <div className="flex justify-center sm:justify-start">
              <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all active:scale-95">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                Modifier mes informations
              </button>
            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
}