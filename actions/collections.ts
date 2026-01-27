"use server";

import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { slugify } from "@/lib/slug";

// Schemas
const collectionSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  categoria: z.string().optional(),
  precoFoto: z.number().min(0, "Preço não pode ser negativo").default(0),
  status: z.enum(["RASCUNHO", "PUBLICADA"]).default("RASCUNHO"),
  faceRecognitionEnabled: z.boolean().optional().default(false),
  filtroFotografoId: z.string().optional(),
});

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
    return { success: true, data: newCollection };
  } catch (error) {
    console.error("Erro ao criar coleção:", error);
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

    return { success: true, data: colecoes };
  } catch (error) {
    console.error("Erro ao buscar coleções:", error);
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

    const updated = await prisma.colecao.update({
      where: { id: collectionId },
      data: {
        nome: data.nome,
        descricao: data.descricao,
        categoria: data.categoria,
        precoFoto: data.precoFoto ? parseFloat(data.precoFoto) : undefined,
        status: data.status,
        capaUrl: data.capaUrl,
        dataInicio: data.dataInicio ? new Date(data.dataInicio) : undefined,
        dataFim: data.dataFim ? new Date(data.dataFim) : undefined,
        cidade: data.cidade,
        estado: data.estado,
        local: data.local,
        descontos: data.descontos,
        faceRecognitionEnabled: data.faceRecognitionEnabled,
      },
    });

    revalidatePath(`/dashboard/fotografo/colecoes/${collectionId}/editar`);
    revalidatePath(`/dashboard/fotografo/colecoes`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Erro ao atualizar coleção:", error);
    return { error: "Falha ao atualizar coleção" };
  }
}
