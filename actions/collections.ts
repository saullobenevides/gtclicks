"use server";

import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { slugify } from "@/lib/slug";
import { serializeModel, serializeDecimal } from "@/lib/serialization";

// --- Schemas ---

const collectionSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  categoria: z.string().optional(),
  precoFoto: z.number().min(0, "Preço não pode ser negativo").default(0),
  status: z.enum(["RASCUNHO", "PUBLICADA"]).default("RASCUNHO"),
  faceRecognitionEnabled: z.boolean().optional().default(false),
  filtroFotografoId: z.string().optional(),
});

const updateCollectionSchema = z.object({
  nome: z.string().min(3).optional(),
  descricao: z.string().optional(),
  categoria: z.string().optional(),
  precoFoto: z.number().min(0).optional(),
  status: z.enum(["RASCUNHO", "PUBLICADA"]).optional(),
  capaUrl: z.string().optional(),
  dataInicio: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce.date().optional(),
  ),
  dataFim: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce.date().optional(),
  ),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  local: z.string().optional(),
  descontos: z.any().optional(), // Json type
  faceRecognitionEnabled: z.boolean().optional(),
});

// --- Actions ---

export async function createCollection(formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: "Não autorizado" };
  }

  const fotografo = await prisma.fotografo.findUnique({
    where: { userId: user.id },
  });

  if (!fotografo) {
    return { error: "Perfil de fotógrafo não encontrado" };
  }

  const rawData = {
    nome: formData.get("nome")?.toString(),
    descricao: formData.get("descricao")?.toString(),
    categoria: formData.get("categoria")?.toString(),
    precoFoto: parseFloat(formData.get("precoFoto")?.toString() || "0"),
    status: formData.get("status")?.toString(),
    faceRecognitionEnabled: formData.get("faceRecognitionEnabled") === "true",
  };

  const validatedFields = collectionSchema.safeParse({ ...rawData });

  if (!validatedFields.success) {
    return {
      error: "Dados inválidos",
      details: validatedFields.error.flatten(),
    };
  }

  try {
    const {
      nome,
      descricao,
      categoria,
      precoFoto,
      status,
      faceRecognitionEnabled,
    } = validatedFields.data;

    // Slug generation
    const baseSlug = slugify(nome);
    let slug = baseSlug;
    let suffix = 1;
    let exists = await prisma.colecao.findUnique({ where: { slug } });
    while (exists) {
      slug = `${baseSlug}-${suffix++}`;
      exists = await prisma.colecao.findUnique({ where: { slug } });
    }

    const newCollection = await prisma.colecao.create({
      data: {
        nome,
        slug,
        descricao,
        categoria,
        precoFoto,
        status,
        faceRecognitionEnabled,
        fotografoId: fotografo.id,
      },
    });

    revalidatePath("/dashboard/colecoes");
    return { success: true, data: serializeCollection(newCollection) };
  } catch (error: any) {
    console.error("[createCollection] Error:", error.message);
    return { error: "Falha ao criar coleção" };
  }
}

export async function getCollections(filters?: { fotografoId?: string }) {
  try {
    const where: any = {};
    if (filters?.fotografoId) {
      where.fotografoId = filters.fotografoId;
    }

    const colecoes = await prisma.colecao.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: colecoes.map(serializeCollection) };
  } catch (error: any) {
    console.error("[getCollections] Error:", error.message);
    return { error: "Falha ao buscar coleções" };
  }
}

export async function updateCollection(collectionId: string, data: any) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Não autorizado" };

  try {
    const collection = await prisma.colecao.findUnique({
      where: { id: collectionId },
      include: { fotografo: true },
    });

    if (!collection || collection.fotografo.userId !== user.id) {
      return { error: "Coleção não encontrada ou permissão negada" };
    }

    const validation = updateCollectionSchema.safeParse({
      ...data,
      precoFoto: data.precoFoto ? parseFloat(data.precoFoto) : undefined,
    });

    if (!validation.success) {
      return {
        error:
          "Dados inválidos: " +
          JSON.stringify(validation.error.flatten().fieldErrors),
      };
    }

    const cleanData = validation.data;

    const updated = await prisma.colecao.update({
      where: { id: collectionId },
      data: cleanData,
    });

    revalidatePath(`/dashboard/fotografo/colecoes/${collectionId}/editar`);
    revalidatePath(`/dashboard/fotografo/colecoes`);
    return { success: true, data: serializeCollection(updated) };
  } catch (error: any) {
    console.error("[updateCollection] Error:", error.message);
    return { error: "Falha ao atualizar coleção" };
  }
}

export async function setCollectionCover(
  collectionId: string,
  photoId: string,
) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Não autorizado" };

  try {
    const photo = await prisma.foto.findUnique({
      where: { id: photoId },
    });

    if (!photo) return { error: "Foto não encontrada" };

    const collection = await prisma.colecao.findUnique({
      where: { id: collectionId },
      include: { fotografo: true },
    });

    if (!collection || collection.fotografo.userId !== user.id) {
      return { error: "Coleção não encontrada ou permissão negada" };
    }

    // Lazy load the processing lib to avoid bundling issues if possible,
    // or just assume it works in server action env.
    const { generateCoverImage } = await import("@/lib/processing");

    const coverUrl = await generateCoverImage(photo.s3Key);

    await prisma.colecao.update({
      where: { id: collectionId },
      data: { capaUrl: coverUrl },
    });

    revalidatePath(`/dashboard/fotografo/colecoes/${collectionId}/editar`);
    revalidatePath(`/dashboard/colecoes`);

    return { success: true, coverUrl };
  } catch (error: any) {
    console.error("[setCollectionCover] Error:", error.message);
    return { error: "Falha ao definir capa. Tente novamente." };
  }
}

function serializeCollection(collection: any) {
  // Uses the central serializer, adding specific override for precoFoto if needed,
  // but serializeModel handles decimals automatically now.
  // Keeping strict type here if needed.
  if (!collection) return null;
  return serializeModel(collection);
}
