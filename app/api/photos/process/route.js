
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { processUploadedImage } from "@/lib/processing";

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
      aperture
    } = body;

    if (!s3Key || !colecaoId) {
        return NextResponse.json({ error: "Dados incompletos (s3Key e colecaoId obrigatórios)" }, { status: 400 });
    }

    const fotografo = await prisma.fotografo.findUnique({
      where: { userId: user.id },
    });

    if (!fotografo) {
      return NextResponse.json({ error: "Fotógrafo não encontrado" }, { status: 403 });
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

        orientacao: (width && height && width > height) ? "HORIZONTAL" : "VERTICAL",

        colecaoId,
        folderId,
        fotografoId: fotografo.id,
        status: "PENDENTE",
        indexingStatus: "PENDENTE"
      }
    });

    console.log(`[Process API] Created photo ${foto.id}, starting processing...`);

    // 2. Trigger async processing
    // Note: Vercel serverless has timeout limits (10s-60s). Processing might take 2-5s, so it should be fine.
    // For production with large files, we might want to decouple this (background job), but for MVP sync is okay.
    
    let processResult;
    try {
        processResult = await processUploadedImage(s3Key, foto.id);
    } catch (procError) {
        console.error("Processing failed, rolling back photo creation", procError);
        // Optional: Delete the phantom record or mark as error
        await prisma.foto.delete({ where: { id: foto.id } });
        return NextResponse.json({ error: "Erro no processamento da imagem", details: procError.message }, { status: 500 });
    }

    // 3. Update Record with Processed Data
    const updatedFoto = await prisma.foto.update({
        where: { id: foto.id },
        data: {
            previewUrl: processResult.previewUrl,
            indexingStatus: processResult.indexingStatus,
            status: "PUBLICADA" // Or PENDENTE if you want manual approval
        }
    });

    return NextResponse.json({
      message: "Processamento concluído",
      foto: updatedFoto
    });

  } catch (error) {
    console.error("Critical error in process route:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor", details: error.message },
      { status: 500 }
    );
  }
}
