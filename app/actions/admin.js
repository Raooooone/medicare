"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

/**
 * Sécurité : Vérifie si l'utilisateur est un ADMIN
 */
async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Action non autorisée. Réservé aux administrateurs.");
  }
  return session;
}

/**
 * Met à jour le statut d'un rendez-vous (CONFIRME ou ANNULE)
 */
export async function updateAppointmentStatus(appointmentId, newStatus) {
  try {
    await verifyAdmin();

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: newStatus },
    });

    // On rafraîchit les pages pour que le patient et l'admin voient le changement
    revalidatePath("/admin");
    revalidatePath("/patient");
    revalidatePath("/medecin");

    return { success: true };
  } catch (error) {
    console.error("Erreur mise à jour statut:", error);
    return { error: "Impossible de modifier le statut du rendez-vous." };
  }
}

/**
 * Créer un utilisateur (Patient ou Médecin)
 */
export async function createUser(formData) {
  await verifyAdmin();
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const role = formData.get("role");
  
  const specialite = formData.get("specialite");
  const age = formData.get("age") ? parseInt(formData.get("age")) : null;
  const maladie = formData.get("maladie");

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name, 
        email: email.toLowerCase(), 
        password: hashedPassword, 
        role,
        specialite: role === "MEDECIN" ? specialite : null,
        age: role === "PATIENT" ? age : null,
        maladie: role === "PATIENT" ? maladie : null,
      }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { error: "L'utilisateur n'a pas pu être créé (email déjà utilisé ?)" };
  }
}

/**
 * Supprimer un utilisateur
 */
export async function deleteUser(userId) {
  await verifyAdmin();
  try {
    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { error: "Impossible de supprimer cet utilisateur (il a peut-être des rendez-vous)." };
  }
}

/**
 * Déconnexion admin
 */
export async function logoutAdmin() {
  const session = await verifyAdmin();
  await prisma.session.deleteMany({
    where: { userId: session.user.id }
  });
  return { success: true };
}