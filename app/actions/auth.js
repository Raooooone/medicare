"use server";

import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import cloudinary from "../../lib/cloudinary"; // Assure-toi d'avoir créé lib/cloudinary.js

export async function registerUser(formData) {
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString() || "PATIENT";
  const adminCode = formData.get("adminCode")?.toString();
  const specialite = formData.get("specialite")?.toString();
  
  // ==========================================
  // 📸 GESTION DE L'UPLOAD VIA CLOUDINARY (Fix Vercel)
  // ==========================================
  const file = formData.get("image");
  let imagePath = null; 

  if (file && typeof file === "object" && file.size > 0) {
    try {
      // 1. Conversion du fichier en buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // 2. Envoi vers Cloudinary (Stream)
      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { 
            folder: "medicare_profiles",
            resource_type: "image"
          }, 
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
      
      // 3. On récupère l'URL sécurisée fournie par Cloudinary
      imagePath = uploadResponse.secure_url;

    } catch (error) {
      console.error("Erreur Cloudinary:", error);
      return { error: "Erreur lors de l'envoi de l'image vers le cloud." };
    }
  }

  // --- VALIDATIONS ---
  if (!name || !email || !password) {
    return { error: "Tous les champs obligatoires doivent être remplis." };
  }

  if (password.length < 6) {
    return { error: "Le mot de passe doit contenir au moins 6 caractères." };
  }

  if (role === "MEDECIN" && !specialite) {
    return { error: "La spécialité est requise pour les médecins." };
  }

  try {
    // --- LOGIQUE ADMIN ---
    if (role === "ADMIN") {
      const SYSTEM_ADMIN_CODE = process.env.ADMIN_SECRET_KEY || "MON_CODE_SUPER_SECRET_123";
      if (adminCode !== SYSTEM_ADMIN_CODE) {
        return { error: "Code d'invitation Admin invalide." };
      }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { error: "Cet email est déjà utilisé." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // --- CRÉATION DB ---
    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        specialite: role === "MEDECIN" ? specialite : null,
        image: imagePath, // Stocke l'URL Cloudinary (https://res.cloudinary.com/...)
      },
    });

    revalidatePath("/admin"); 
    return { success: true };

  } catch (error) {
    console.error("Erreur critique d'inscription :", error);
    return { error: "Une erreur technique est survenue." };
  }
}