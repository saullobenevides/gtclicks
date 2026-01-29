"use server";

import { searchByFace, indexPhotoFaces } from "@/lib/rekognition";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Busca fotos através de uma selfie enviada pelo usuário
 * @param {FormData} formData
 */
export async function searchPhotosBySelfie(formData: FormData) {
  try {
    const user = await getAuthenticatedUser();

    // Auth check - Optional?
    // If the requirement allows anonymous search, we might skip this BUT the plan said "Enable real getAuthenticatedUser".
    // Assuming we want to allow search only for logged users or track valid users.
    // If anonymous is allowed, we should at least have a session ID or similar.
    // However, looking at the code `userId: authUser?.id`, let's enforce auth for now to be safe,
    // or at least require it for rate limiting.

    // For MVP/User request: "Contém código provisório... ignorando autenticação. É um risco".
    // So we MUST enforce auth.
    if (!user) {
      return {
        error: "Você precisa estar logado para realizar a busca por selfie.",
      };
    }

    const file = formData.get("selfie") as File;
    if (!file) return { error: "Nenhuma imagem enviada" };

    // --- USAGE LIMIT CHECK ---
    const searchLimit = 5;
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const searchCount = await prisma.usageLog.count({
      where: {
        action: "SELFIE_SEARCH",
        createdAt: { gte: twentyFourHoursAgo },
        userId: user.id,
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
        userId: user.id,
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
        colecao: { status: "PUBLICADA" }, // Fixed from APPROVED to PUBLICADA based on other files
      },
      include: {
        colecao: {
          select: {
            nome: true,
            slug: true,
            precoFoto: true,
          },
        },
      },
    });

    // Simple serialization just in case
    const serializedPhotos = photos.map((p) => ({
      ...p,
      colecao: {
        ...p.colecao,
        precoFoto: p.colecao?.precoFoto ? Number(p.colecao.precoFoto) : 0,
      },
    }));

    return { data: serializedPhotos };
  } catch (error: any) {
    console.error("[searchPhotosBySelfie] Error:", error.message);
    return { error: "Ocorreu um erro ao processar sua busca." };
  }
}

/**
 * Força a indexação de faces de uma foto (Admin/Fotógrafo)
 * @param {string} photoId
 */
export async function forceIndexPhoto(photoId: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { error: "Não autorizado" };
    }

    const photo = await prisma.foto.findUnique({
      where: { id: photoId },
      include: {
        fotografo: true,
      },
    });

    if (!photo) return { error: "Foto não encontrada" };

    // Permission check
    if (photo.fotografo?.userId !== user.id && user.role !== "ADMIN") {
      return { error: "Permissão negada" };
    }

    const bucket = process.env.S3_UPLOAD_BUCKET!;
    const result = await indexPhotoFaces(bucket, photo.s3Key, photo.id);

    if (result.success) {
      await prisma.foto.update({
        where: { id: photoId },
        data: {
          indexingStatus: "INDEXED", // Check schema, using existing field from previous read
          indexedFaceIds: result.indexedFaces,
        },
      });
      revalidatePath(`/dashboard/fotografo/colecoes`);
      return { success: true, faceCount: result.faceCount };
    }

    return { error: result.error };
  } catch (error: any) {
    console.error("[forceIndexPhoto] Error:", error.message);
    return { error: "Erro interno ao indexar foto." };
  }
}
