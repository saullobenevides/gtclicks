import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { processUploadedImage } from "@/lib/processing";
import { indexPhotoFaces } from "@/lib/rekognition";

export async function POST(request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      s3Key,
      colecaoId,
      folderId,
      titulo,
      width,
      height,
      camera,
      lens,
      focalLength,
      iso,
      shutterSpeed,
      aperture,
    } = body;

    if (!s3Key || !colecaoId) {
      return NextResponse.json(
        { error: "Dados incompletos (s3Key e colecaoId obrigatórios)" },
        { status: 400 },
      );
    }

    const fotografo = await prisma.fotografo.findUnique({
      where: { userId: user.id },
    });

    if (!fotografo) {
      return NextResponse.json(
        { error: "Fotógrafo não encontrado" },
        { status: 403 },
      );
    }

    // 1. Create Initial Record (Pending)
    // We create it first to get the ID for Rekognition
    const foto = await prisma.foto.create({
      data: {
        titulo: titulo || "Sem título",
        s3Key,
        width: width || 0,
        height: height || 0,
        formato: "jpg", // Default, will be validated if needed.
        tamanhoBytes: 0, // We could get this from S3 head object but optional for now
        previewUrl: "", // Placeholder until processed

        camera,
        lens,
        focalLength,
        iso: iso ? parseInt(iso) : null,
        shutterSpeed,
        aperture,

        orientacao:
          width && height && width > height ? "HORIZONTAL" : "VERTICAL",

        colecaoId,
        folderId,
        fotografoId: fotografo.id,
        status: "PENDENTE",
        indexingStatus: "PENDENTE",
      },
    });

    console.log(
      `[Process API] Created photo ${foto.id}, starting processing...`,
    );

    // 2. Trigger async processing
    // Note: Vercel serverless has timeout limits (10s-60s). Processing might take 2-5s, so it should be fine.
    // For production with large files, we might want to decouple this (background job), but for MVP sync is okay.

    let processResult;
    try {
      processResult = await processUploadedImage(s3Key, foto.id);
    } catch (procError) {
      console.error(
        "Processing failed, rolling back photo creation",
        procError,
      );

      // 🚨 ARCHITECTURE NOTE:
      // We create the record BEFORE processing to get an ID.
      // If processing fails, we must manually delete (rollback).
      // If this delete fails, we might have a "phantom" record.
      // TODO: Implement a background cleanup job for PENDING photos older than X hours.
      try {
        await prisma.foto.delete({ where: { id: foto.id } });
        console.log(`[Process API] Rollback successful for photo ${foto.id}`);
      } catch (rollbackError) {
        console.error(
          `[Process API] CRITICAL: Rollback failed for photo ${foto.id}`,
          rollbackError,
        );
      }

      return NextResponse.json(
        {
          error: "Erro no processamento da imagem",
          details: procError.message,
        },
        { status: 500 },
      );
    }

    // 3. Update Record with Processed Data
    const updatedFoto = await prisma.foto.update({
      where: { id: foto.id },
      data: {
        previewUrl: processResult.previewUrl,
        status: "PUBLICADA",
      },
      include: {
        colecao: {
          select: { faceRecognitionEnabled: true },
        },
      },
    });

    // 4. Async Facial Recognition Indexing (Optional/Background)
    if (updatedFoto.colecao?.faceRecognitionEnabled) {
      console.log(`[Process API] Indexing faces for photo ${foto.id}...`);
      const bucket = process.env.S3_UPLOAD_BUCKET;

      // we run this without await to not block the response,
      // or we can await it if we want to be sure.
      // since it's a serverless function, better avoid detached promises if possible,
      // but let's await for reliability in this specific step.
      try {
        const indexResult = await indexPhotoFaces(bucket, s3Key, foto.id);
        if (indexResult.success) {
          await prisma.foto.update({
            where: { id: foto.id },
            data: {
              indexingStatus: "INDEXED",
              indexedFaceIds: indexResult.indexedFaces,
            },
          });
          console.log(
            `[Process API] Indexed ${indexResult.faceCount} faces for photo ${foto.id}`,
          );
        } else {
          await prisma.foto.update({
            where: { id: foto.id },
            data: { indexingStatus: "FAILED" },
          });
        }
      } catch (indexError) {
        console.error(
          `[Process API] Face indexing background error for ${foto.id}:`,
          indexError,
        );
      }
    }

    return NextResponse.json({
      message: "Processamento concluído",
      foto: updatedFoto,
    });
  } catch (error) {
    console.error("Critical error in process route:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor", details: error.message },
      { status: 500 },
    );
  }
}
