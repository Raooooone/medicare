"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Vérifie si l'utilisateur est un médecin authentifié
 */
async function verifyMedecin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "MEDECIN") {
    throw new Error("Action non autorisée. Réservé aux médecins.");
  }
  return session;
}

/**
 * Met à jour le statut d'un rendez-vous (Confirmé/Annulé)
 */
export async function updateAppointmentStatus(appointmentId, status) {
  const session = await verifyMedecin();

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId }
  });

  if (!appointment || appointment.doctorId !== session.user.id) {
    throw new Error("Ce rendez-vous ne vous est pas assigné.");
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: status }
  });

  revalidatePath("/medecin");
  revalidatePath("/", "layout"); 
  return { success: true };
}

/**
 * MET À JOUR LE PROFIL DU MÉDECIN (Fonction manquante corrigée)
 * Gère la modification du nom, téléphone, horaires et image
 */
export async function updateMedecinProfile(formData) {
  const session = await verifyMedecin();
  
  const name = formData.get("name");
  const phone = formData.get("phone");
  const workingHours = formData.get("workingHours");
  const image = formData.get("image");

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name,
        contact: phone,      // Champ téléphone
        workingHours: workingHours, // Horaires de travail
        image: image,        // Photo de profil
      },
    });

    // On rafraîchit les pages pour voir les changements immédiatement
    revalidatePath("/medecin/profil");
    revalidatePath("/", "layout"); 
    
    return { success: true };
  } catch (error) {
    console.error("Erreur mise à jour profil:", error);
    return { error: "Impossible de mettre à jour le profil." };
  }
}