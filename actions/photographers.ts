"use server";

import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { serializeDecimal, serializeModel } from "@/lib/serialization";

// --- Schemas ---

const createPhotographerSchema = z.object({
  username: z
    .string()
    .min(3, "Username muito curto")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username deve conter apenas letras, números e underline"
    )
    .optional(),
  bio: z.string().max(500, "Bio muito longa").optional(),
  telefone: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2, "UF deve ter 2 caracteres").optional(),
  instagram: z.string().optional(),
  chavePix: z.string().optional(),
});

const updatePhotographerSchema = z.object({
  bio: z.string().max(500).optional(),
  telefone: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  instagram: z.string().optional(),
  // chavePix: z.string().optional(), // Removed
  portfolioUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  equipamentos: z.string().optional(),
  // cpf: z.string().optional(), // Removed
  especialidades: z.array(z.string()).optional(),
});

// --- Helper ---

function generateUniqueUsername(baseName: string) {
  let username = baseName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");

  const randomSuffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `@${username}_${randomSuffix}`;
}

// --- Actions ---

export async function createPhotographer(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: "Não autorizado" };
  }

  const rawData = {
    username: formData.get("username")?.toString(),
    bio: formData.get("bio")?.toString(),
    telefone: formData.get("telefone")?.toString(),
    cidade: formData.get("cidade")?.toString(),
    estado: formData.get("estado")?.toString(),
    instagram: formData.get("instagram")?.toString(),
    chavePix: formData.get("chavePix")?.toString(),
  };

  const validation = createPhotographerSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      error: "Dados inválidos",
      details: validation.error.flatten().fieldErrors,
    };
  }

  const data = validation.data;

  try {
    const existing = await prisma.fotografo.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      return { success: true, data: serializeModel(existing) };
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    // Ensure user role is updated
    if (!dbUser) {
      // Should catch this edge case where user exists in Auth but not DB (sync issue)
      // Ideally auth.js handles this, but defensive coding here.
      await prisma.user.create({
        data: {
          ...(user as any), // Fallback, though user object from auth is clean
          id: user.id,
          email: user.email,
          role: "FOTOGRAFO",
        },
      });
    } else if (dbUser.role !== "FOTOGRAFO") {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "FOTOGRAFO" },
      });
    }

    let finalUsername = data.username;
    if (!finalUsername) {
      const baseName = user.name || user.email?.split("@")[0] || "fotografo";
      finalUsername = generateUniqueUsername(baseName);

      let attempt = 0;
      while (attempt < 10) {
        const exists = await prisma.fotografo.findUnique({
          where: { username: finalUsername },
        });
        if (!exists) break;
        finalUsername = generateUniqueUsername(baseName);
        attempt++;
      }
      if (attempt >= 10) throw new Error("Falha ao gerar username único");
    } else {
      // Remove @ if present at start
      if (finalUsername.startsWith("@"))
        finalUsername = finalUsername.substring(1);
    }

    const newPhotographer = await prisma.fotografo.create({
      data: {
        userId: user.id,
        username: finalUsername,
        bio: data.bio || "Fotógrafo profissional",
        telefone: data.telefone,
        cidade: data.cidade,
        estado: data.estado,
        instagram: data.instagram,
        chavePix: data.chavePix,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, data: serializeModel(newPhotographer) };
  } catch (error: any) {
    console.error("[createPhotographer] Error:", error.message);
    return { error: "Falha ao criar perfil" };
  }
}

export async function updatePhotographer(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Não autorizado" };

  const rawData = {
    bio: formData.get("bio")?.toString(),
    telefone: formData.get("telefone")?.toString(),
    cidade: formData.get("cidade")?.toString(),
    estado: formData.get("estado")?.toString(),
    instagram: formData.get("instagram")?.toString()?.replace(/^@/, ""),
    // chavePix: formData.get("chavePix")?.toString(),
    portfolioUrl: formData.get("portfolioUrl")?.toString(),
    equipamentos: formData.get("equipamentos")?.toString(),
    // cpf: formData.get("cpf")?.toString(),
  };

  const validation = updatePhotographerSchema.safeParse({
    ...rawData,
    especialidades: formData.getAll("especialidades"),
  });

  if (!validation.success) {
    return {
      error: "Dados inválidos",
      details: validation.error.flatten().fieldErrors,
    };
  }

  const data = validation.data;

  try {
    const updated = await prisma.fotografo.update({
      where: { userId: user.id },
      data: {
        bio: data.bio,
        telefone: data.telefone,
        cidade: data.cidade,
        estado: data.estado,
        instagram: data.instagram,
        // chavePix: data.chavePix, // Removed for security (use updatePixKey)
        portfolioUrl: data.portfolioUrl,
        equipamentos: data.equipamentos,
        // cpf: data.cpf, // Removed for security
        especialidades: data.especialidades,
      },
    });

    revalidatePath(`/fotografos/${updated.username}`);
    return { success: true, data: serializeModel(updated) };
  } catch (error: any) {
    console.error("[updatePhotographer] Error:", error.message);
    return { error: "Falha ao atualizar perfil" };
  }
}
