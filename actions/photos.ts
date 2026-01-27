"use server";

import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Alterna o estado de "like" de uma foto para o usuário atual
 */
export async function togglePhotoLike(fotoId: string) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { error: "Não autorizado" };
  }

  try {
    // Check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_fotoId: {
          userId: user.id,
          fotoId: fotoId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.$transaction([
        prisma.like.delete({
          where: {
            userId_fotoId: {
              userId: user.id,
              fotoId: fotoId,
            },
          },
        }),
        prisma.foto.update({
          where: { id: fotoId },
          data: { likes: { decrement: 1 } },
        }),
      ]);

      revalidatePath(`/fotos/${fotoId}`);
      return { success: true, liked: false };
    } else {
      // Like
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId: user.id,
            fotoId: fotoId,
          },
        }),
        prisma.foto.update({
          where: { id: fotoId },
          data: { likes: { increment: 1 } },
        }),
      ]);

      revalidatePath(`/fotos/${fotoId}`);
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error("[Action] togglePhotoLike error:", error);
    return { error: "Erro ao processar like" };
  }
}

/**
 * Busca os IDs das fotos curtidas pelo usuário atual
 */
export async function getUserLikedPhotoIds() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { data: [] };
  }

  try {
    const likes = await prisma.like.findMany({
      where: { userId: user.id },
      select: { fotoId: true },
    });

    return { success: true, data: likes.map((l) => l.fotoId) };
  } catch (error) {
    console.error("[Action] getUserLikedPhotoIds error:", error);
    return { error: "Erro ao buscar likes", data: [] };
  }
}

/**
 * Busca os objetos completos das fotos curtidas pelo usuário atual
 */
export async function getLikedPhotos() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { data: [] };
  }

  try {
    const likes = await prisma.like.findMany({
      where: { userId: user.id },
      include: {
        foto: {
          include: {
            fotografo: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: likes.map((l) => l.foto) };
  } catch (error) {
    console.error("[Action] getLikedPhotos error:", error);
    return { error: "Erro ao buscar fotos curtidas", data: [] };
  }
}
