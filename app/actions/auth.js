"use server";

import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function registerUser(formData) {
  // Extraction des données de base
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString() || "PATIENT";
  const adminCode = formData.get("adminCode")?.toString();

  // Nouvelles données spécifiques au Médecin
  const specialite = formData.get("specialite")?.toString();
  const image = formData.get("image")?.toString();

  // 1. Validation de base des champs
  if (!name || !email || !password) {
    return { error: "Tous les champs obligatoires doivent être remplis." };
  }

  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
  }

  // Validation spécifique pour le Médecin (Étapes supplémentaires)
  if (role === "MEDECIN") {
    if (!specialite) return { error: "La spécialité est requise pour les médecins." };
    if (!image) return { error: "Une image de profil est requise pour les médecins." };
  }

  try {
    // 2. Validation de sécurité stricte pour le rôle ADMIN
    if (role === "ADMIN") {
      const SYSTEM_ADMIN_CODE = process.env.ADMIN_SECRET_KEY || "MON_CODE_SUPER_SECRET_123";
      if (adminCode !== SYSTEM_ADMIN_CODE) {
        return { error: "Code d'invitation Admin invalide. Accès refusé." };
      }
    }

    // 3. Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { error: "Cet email est déjà utilisé par un autre compte." };
    }

    // 4. Hachage sécurisé du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Création de l'utilisateur dans PostgreSQL
    await prisma.user.create({
      data: {
        name: name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role,
        // Ces champs seront null si l'utilisateur n'est pas médecin
        specialite: role === "MEDECIN" ? specialite : null,
        image: role === "MEDECIN" ? image : null,
      },
    });

    // 6. Mise à jour du cache
    revalidatePath("/admin"); 

    return { success: true };

  } catch (error) {
    console.error("Erreur critique lors de l'inscription :", error);
    return { error: "Une erreur technique est survenue. Veuillez réessayer plus tard." };
  }
}