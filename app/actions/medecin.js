"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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
 * MET À JOUR LE PROFIL DU MÉDECIN
 */
export async function updateMedecinProfile(formData) {
  const session = await verifyMedecin();
  
  // 1. SÉCURITÉ : On force la conversion en chaîne de caractères (String)
  // Sinon Prisma risque de bloquer lors de la sauvegarde !
  const name = formData.get("name")?.toString() || "";
  const phone = formData.get("phone")?.toString() || null;
  const workingHours = formData.get("workingHours")?.toString() || null;

  // -- GESTION DE LA NOUVELLE IMAGE --
  const file = formData.get("image");
  let newImagePath = undefined; 

  if (file && typeof file === "object" && file.size > 0) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      // On nettoie le nom du fichier pour enlever les caractères bizarres
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const filename = Date.now() + "_" + safeFileName;
      
      const uploadDir = path.join(process.cwd(), "public/uploads");
      await mkdir(uploadDir, { recursive: true }); 
      
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      
      newImagePath = `/uploads/${filename}`;
    } catch (error) {
      console.error("Erreur lors de l'upload de l'image:", error);
      return { error: "Erreur d'upload du fichier : " + error.message };
    }
  }

  try {
    // Préparation des données à envoyer à Prisma
    const dataToUpdate = {
      name: name,
      contact: phone,
      workingHours: workingHours,
    };

    if (newImagePath) {
      dataToUpdate.image = newImagePath;
    }

    // Mise à jour dans la base de données
    await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
    });

    // On rafraîchit les pages pour voir les changements immédiatement
    revalidatePath("/medecin/profil");
    revalidatePath("/", "layout"); 
    
    return { success: true };
  } catch (error) {
    console.error("Erreur Prisma:", error);
    // 👇 NOUVEAU : On renvoie l'erreur EXACTE pour comprendre ce qui bloque ! 👇
    return { error: "Erreur Base de données : " + error.message };
  }
}

/**
 * AJOUTE UNE NOTE DE CONSULTATION AU DOSSIER
 */
export async function addConsultationNote(appointmentId, notes) {
  const session = await verifyMedecin();

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId }
  });

  if (!appointment || appointment.doctorId !== session.user.id) {
    return { error: "Vous ne pouvez modifier que vos propres rendez-vous." };
  }

  try {
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { notes: notes }
    });

    revalidatePath("/medecin");
    revalidatePath("/patient");
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'ajout de la note:", error);
    return { error: "Erreur lors de l'enregistrement de la note." };
  }
}