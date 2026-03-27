"use server";

import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

/**
 * Action pour réserver un rendez-vous
 * @param {string} doctorId - L'ID du médecin sélectionné
 * @param {string} dateStr - La date choisie au format string (ex: ISO)
 */
export async function bookAppointment(doctorId, dateStr) {
  try {
    // 1. Vérification de la session utilisateur
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return { error: "Vous devez être connecté pour prendre rendez-vous." };
    }

    // 2. Validation des données reçues
    if (!doctorId || !dateStr) {
      return { error: "Médecin ou date manquante." };
    }

    // 3. Création du rendez-vous dans Supabase via Prisma
    const newAppointment = await prisma.appointment.create({
      data: {
        date: new Date(dateStr),
        status: "EN_ATTENTE", // Statut par défaut
        patientId: session.user.id, // ID récupéré de la session sécurisée
        doctorId: doctorId,
      },
    });

    // 4. Rafraîchissement du cache Next.js pour voir le changement
    revalidatePath("/patient");

    return { 
      success: true, 
      message: "Demande de rendez-vous envoyée avec succès !",
      data: newAppointment // <--- On utilise la variable définie plus haut
    };

  } catch (error) {
    // Log détaillé dans votre terminal VS Code pour le débug
    console.error("Erreur critique lors de la réservation :", error);
    
    return { 
      error: "Le serveur n'a pas pu enregistrer le rendez-vous. Vérifiez la connexion DB." 
    };
  }
}