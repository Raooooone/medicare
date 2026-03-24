"use client";
import { useState } from "react";
import Link from "next/link";

export default function DoctorDirectory({ doctors = [] }) {
  const [selectedSpecialty, setSelectedSpecialty] = useState("Toutes");

  // Extraire la liste unique des spécialités (en appliquant "Généraliste" si vide)
  const specialties = [
    "Toutes", 
    ...new Set(doctors.map((d) => d.specialite || "Généraliste"))
  ];

  // Filtrer les médecins
  const filteredDoctors = selectedSpecialty === "Toutes" 
    ? doctors 
    : doctors.filter((d) => (d.specialite || "Généraliste") === selectedSpecialty);

  return (
    <div className="w-full">
      
      {/* =========================================
          BARRE DE FILTRES (Boutons Pilules)
          ========================================= */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {specialties.map((specialty, index) => (
          <button
            key={index}
            onClick={() => setSelectedSpecialty(specialty)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
              selectedSpecialty === specialty
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 hover:shadow-sm"
            }`}
          >
            {specialty}
          </button>
        ))}
      </div>

      {/* =========================================
          GRILLE DES MÉDECINS (3 PAR LIGNE)
          ========================================= */}
      {filteredDoctors.length === 0 ? (
        <div className="text-center text-gray-500 py-10 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <p className="font-medium text-lg">Aucun médecin trouvé pour cette spécialité.</p>
        </div>
      ) : (
        /* 👇 La grille configurée pour un maximum de 3 colonnes sur PC 👇 */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 border border-gray-100/80 flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 group">
              
              {/* IMAGE (Grande et parfaitement ronde) */}
              <div className="relative mb-6">
                {/* Lueur bleue au survol */}
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                
                {/* Image Cercle Parfait */}
                <img 
                  src={doc.image || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png"} 
                  alt={`Dr. ${doc.name}`} 
                  className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full object-cover aspect-square border-[6px] border-gray-50 shadow-md group-hover:border-white transition-all duration-300 bg-white"
                  onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/3774/3774299.png" }} 
                />
                
                {/* Petit point vert décoratif */}
                <div className="absolute bottom-2 right-4 w-5 h-5 bg-green-500 border-4 border-white rounded-full shadow-sm"></div>
              </div>

              {/* Infos du médecin */}
              <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                Dr. {doc.name}
              </h3>
              
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-8 border border-blue-100">
                {doc.specialite || "Généraliste"}
              </span>

              {/* Bouton Prendre RDV */}
              <Link 
                href="/patient" 
                className="mt-auto w-full relative overflow-hidden group/btn rounded-xl"
              >
                <div className="absolute inset-0 bg-gray-50 group-hover/btn:bg-blue-600 transition-colors duration-300 border border-gray-200 group-hover/btn:border-transparent rounded-xl"></div>
                <div className="relative py-3.5 text-sm font-bold text-gray-700 group-hover/btn:text-white transition-colors duration-300 flex justify-center items-center gap-2">
                  Prendre RDV
                  <svg className="w-4 h-4 opacity-0 -ml-4 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
              </Link>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}