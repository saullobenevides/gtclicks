"use server";

// import { searchByFace, indexPhotoFaces } from "@/lib/rekognition"; // TODO: Rekognition desabilitado
// import prisma from "@/lib/prisma";
// import { getAuthenticatedUser } from "@/lib/auth";
// import { revalidatePath } from "next/cache";

/**
 * Busca fotos através de uma selfie enviada pelo usuário
 * TODO: Reconhecimento facial temporariamente desabilitado até Rekognition estar configurado
 */
export async function searchPhotosBySelfie(_formData: FormData) {
  return { error: "Busca por selfie temporariamente indisponível. Em breve!" };

  // try {
  //   const user = await getAuthenticatedUser();
  //   if (!user) return { error: "Você precisa estar logado para realizar a busca por selfie." };
  //   const file = formData.get("selfie") as File;
  //   if (!file) return { error: "Nenhuma imagem enviada" };
  //   const buffer = Buffer.from(await file.arrayBuffer());
  //   const result = await searchByFace(buffer);
  //   ...
  // }
}

/**
 * Força a indexação de faces de uma foto (Admin/Fotógrafo)
 * TODO: Reconhecimento facial temporariamente desabilitado
 */
export async function forceIndexPhoto(_photoId: string) {
  return { error: "Indexação facial temporariamente indisponível." };

  // try {
  //   const user = await getAuthenticatedUser();
  //   ...
  //   const result = await indexPhotoFaces(bucket, photo.s3Key, photo.id);
  //   ...
  // }
}
