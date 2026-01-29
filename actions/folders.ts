"use server";

import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// --- VALIDATION SCHEMAS ---

const createFolderSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(50, "Nome muito longo"),
  colecaoId: z.string().cuid("ID de coleção inválido"),
  parentId: z.string().optional().nullable(),
});

const updateFolderSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(50, "Nome muito longo")
    .optional(),
  parentId: z.string().optional().nullable(),
});

/**
 * Cria uma nova pasta em uma coleção
 */
export async function createFolder(data: {
  nome: string;
  colecaoId: string;
  parentId?: string | null;
}) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: "Não autorizado" };
  }

  const validation = createFolderSchema.safeParse(data);

  if (!validation.success) {
    return {
      error: "Dados inválidos",
      details: validation.error.flatten().fieldErrors,
    };
  }

  const { nome, colecaoId, parentId } = validation.data;

  try {
    // Verificar propriedade
    const colecao = await prisma.colecao.findUnique({
      where: { id: colecaoId },
      include: { fotografo: true },
    });

    if (!colecao || colecao.fotografo.userId !== user.id) {
      return { error: "Coleção não encontrada ou sem permissão" };
    }

    const folder = await prisma.folder.create({
      data: {
        nome,
        colecaoId,
        parentId: parentId || null,
      },
    });

    revalidatePath(`/dashboard/fotografo/colecoes/${colecaoId}`);
    return { success: true, data: folder };
  } catch (error: any) {
    console.error("[Action] createFolder error:", error);
    if (error.code === "P2002") {
      return { error: "Já existe uma pasta com este nome neste local." };
    }
    return { error: "Erro ao criar pasta" };
  }
}

/**
 * Busca pastas de uma coleção
 */
export async function getFolders(colecaoId: string, parentId?: string | null) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: "Não autorizado" };
  }

  try {
    // Verificar propriedade
    const colecao = await prisma.colecao.findUnique({
      where: { id: colecaoId },
      include: { fotografo: true },
    });

    if (!colecao || colecao.fotografo.userId !== user.id) {
      return { error: "Coleção não encontrada ou sem permissão" };
    }

    const folders = await prisma.folder.findMany({
      where: {
        colecaoId,
        parentId: parentId || null,
      },
      orderBy: { nome: "asc" },
      include: {
        _count: {
          select: { fotos: true, children: true },
        },
      },
    });

    return { success: true, data: folders };
  } catch (error) {
    console.error("[Action] getFolders error:", error);
    return { error: "Erro ao listar pastas" };
  }
}

/**
 * Atualiza uma pasta (renomear ou mover)
 */
export async function updateFolder(
  folderId: string,
  data: { nome?: string; parentId?: string | null },
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: "Não autorizado" };
  }

  const validation = updateFolderSchema.safeParse(data);
  if (!validation.success) {
    return {
      error: "Dados inválidos",
      details: validation.error.flatten().fieldErrors,
    };
  }

  // Use validated data
  // Explicitly extract validated fields to avoid passing unknown properties
  const { nome, parentId } = validation.data;

  try {
    // Verificar propriedade através da cadeia folder -> colecao -> fotografo
    const existingFolder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: { colecao: { include: { fotografo: true } } },
    });

    if (
      !existingFolder ||
      existingFolder.colecao.fotografo.userId !== user.id
    ) {
      return { error: "Pasta não encontrada ou sem permissão" };
    }

    const folder = await prisma.folder.update({
      where: { id: folderId },
      data: {
        nome: nome || undefined,
        // If parentId is strictly null or string, we accept it. undefined is ignored.
        parentId: parentId === undefined ? undefined : parentId,
      },
    });

    revalidatePath(`/dashboard/fotografo/colecoes/${existingFolder.colecaoId}`);
    return { success: true, data: folder };
  } catch (error: any) {
    console.error("[Action] updateFolder error:", error);
    if (error.code === "P2002") {
      return { error: "Já existe uma pasta com este nome neste local." };
    }
    return { error: "Erro ao atualizar pasta" };
  }
}

/**
 * Deleta uma pasta
 */
export async function deleteFolder(folderId: string) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: "Não autorizado" };
  }

  try {
    const existingFolder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: { colecao: { include: { fotografo: true } } },
    });

    if (
      !existingFolder ||
      existingFolder.colecao.fotografo.userId !== user.id
    ) {
      return { error: "Pasta não encontrada ou sem permissão" };
    }

    await prisma.folder.delete({
      where: { id: folderId },
    });

    revalidatePath(`/dashboard/fotografo/colecoes/${existingFolder.colecaoId}`);
    return { success: true };
  } catch (error) {
    console.error("[Action] deleteFolder error:", error);
    return { error: "Erro ao deletar pasta" };
  }
}
