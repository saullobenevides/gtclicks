"use server";

import { searchByFace, indexPhotoFaces } from "@/lib/rekognition";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Busca fotos através de uma selfie enviada pelo usuário
 * @param {FormData} formData
 */
export async function searchPhotosBySelfie(formData) {
  try {
    const file = formData.get("selfie");
    if (!file) return { error: "Nenhuma imagem enviada" };

    // --- USAGE LIMIT CHECK ---
    const user = await prisma.user.findFirst(); // Fallback for testing if no auth, but we should use getAuthenticatedUser
    // In production, we'd use: const authUser = await getAuthenticatedUser();

    // For now, let's use a simplified check or just log it
    const searchLimit = 5;
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // If we have a user, check their individual limit
    const searchCount = await prisma.usageLog.count({
      where: {
        action: "SELFIE_SEARCH",
        createdAt: { gte: twentyFourHoursAgo },
        // userId: authUser?.id // If we implement auth here
      },
    });

    if (searchCount >= searchLimit) {
      return {
        error: "Limite diário de buscas atingido. Tente novamente amanhã.",
      };
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await searchByFace(buffer);

    if (!result.success) {
      return { error: result.error || "Erro na busca facial" };
    }

    // Log the usage
    await prisma.usageLog.create({
      data: {
        action: "SELFIE_SEARCH",
        metadata: {
          matchedCount: result.matchedPhotoIds.length,
          success: true,
        },
      },
    });

    if (result.matchedPhotoIds.length === 0) {
      return { data: [], message: "Nenhuma foto encontrada para este rosto." };
    }

    // Busca as fotos no banco de dados baseado nos IDs retornados
    const photos = await prisma.foto.findMany({
      where: {
        id: { in: result.matchedPhotoIds },
        colecao: { status: "APPROVED" }, // Apenas fotos de coleções aprovadas
      },
      include: {
        colecao: {
          select: {
            nome: true,
            slug: true,
          },
        },
      },
    });

    return { data: photos };
  } catch (error) {
    console.error("[Action] searchPhotosBySelfie error:", error);
    return { error: "Ocorreu um erro ao processar sua busca." };
  }
}

/**
 * Força a indexação de faces de uma foto (Admin/Fotógrafo)
 * @param {string} photoId
 */
export async function forceIndexPhoto(photoId) {
  try {
    const photo = await prisma.foto.findUnique({
      where: { id: photoId },
      select: { id: true, s3Key: true },
    });

    if (!photo) return { error: "Foto não encontrada" };

    const bucket = process.env.S3_UPLOAD_BUCKET;
    const result = await indexPhotoFaces(bucket, photo.s3Key, photo.id);

    if (result.success) {
      await prisma.foto.update({
        where: { id: photoId },
        data: {
          faceIndexingStatus: "INDEXED",
          indexedFaceIds: result.indexedFaces,
        },
      });
      revalidatePath(`/dashboard/fotografo/colecoes`);
      return { success: true, faceCount: result.faceCount };
    }

    return { error: result.error };
  } catch (error) {
    console.error("[Action] forceIndexPhoto error:", error);
    return { error: "Erro interno ao indexar foto." };
  }
}
