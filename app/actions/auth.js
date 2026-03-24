"use server";

import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
// 👇 On ajoute 'mkdir' pour créer le dossier automatiquement
import { writeFile, mkdir } from "fs/promises"; 
import path from "path";

export async function registerUser(formData) {
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString() || "PATIENT";
  const adminCode = formData.get("adminCode")?.toString();
  const specialite = formData.get("specialite")?.toString();
  
  // ==========================================
  // 📸 GESTION DE L'UPLOAD DE L'IMAGE
  // ==========================================
  const file = formData.get("image");
  let imagePath = null; 

  if (file && typeof file === "object" && file.size > 0) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");
      
      // 1. On définit le chemin du dossier d'upload
      const uploadDir = path.join(process.cwd(), "public/uploads");
      
      // 2. ✨ LA MAGIE ICI : On crée le dossier s'il n'existe pas ! ✨
      await mkdir(uploadDir, { recursive: true });
      
      // 3. On sauvegarde l'image à l'intérieur
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      
      imagePath = `/uploads/${filename}`;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'image:", error);
      return { error: "Erreur lors de l'enregistrement de l'image sur le serveur." };
    }
  }

  if (!name || !email || !password) {
    return { error: "Tous les champs obligatoires doivent être remplis." };
  }

  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
  }

  if (role === "MEDECIN") {
    if (!specialite) return { error: "La spécialité est requise pour les médecins." };
  }

  try {
    if (role === "ADMIN") {
      const SYSTEM_ADMIN_CODE = process.env.ADMIN_SECRET_KEY || "MON_CODE_SUPER_SECRET_123";
      if (adminCode !== SYSTEM_ADMIN_CODE) {
        return { error: "Code d'invitation Admin invalide. Accès refusé." };
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { error: "Cet email est déjà utilisé par un autre compte." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role,
        specialite: role === "MEDECIN" ? specialite : null,
        image: role === "MEDECIN" ? imagePath : null, 
      },
    });

    revalidatePath("/admin"); 
    return { success: true };

  } catch (error) {
    console.error("Erreur critique lors de l'inscription :", error);
    return { error: "Une erreur technique est survenue. Veuillez réessayer plus tard." };
  }
}