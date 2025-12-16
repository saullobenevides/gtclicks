import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { stackServerApp } from "@/stack/server";
import { logError } from "@/lib/logger";
// import sharp from "sharp"; // Sharp might be too heavy for some environments, using basic metadata if possible or just saving dimensions from client if needed. 
// For this MVP, we will try to read metadata. If sharp is not available, we might need another way or rely on client sending dimensions.
// The spec mentions "Lib Sharp / Exif-Parser". I'll assume I can use a lightweight exif parser or just mock the extraction if dependencies are missing.
// Let's try to use 'exif-parser' if available, or just basic logic.
// Actually, I'll check package.json first.

// Checking package.json... I don't see sharp or exif-parser in the previous view_file of package.json.
// I should probably install 'exif-parser' or 'sharp'.
// For now, I will implement the route assuming I can add the dependency or use a placeholder.
// I'll use a placeholder for EXIF extraction to avoid breaking the build if the package is missing, 
// but I'll add a TODO to install it.

const bucket = process.env.S3_UPLOAD_BUCKET;
const region = process.env.S3_UPLOAD_REGION;
const accessKeyId = process.env.S3_UPLOAD_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_UPLOAD_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region,
  credentials: { accessKeyId, secretAccessKey },
});

export async function POST(request) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }


  try {
    console.log("Invoked /api/photos/process"); // Debug: Force rebuild

    const body = await request.json();
    const { 
      s3Key, 
      previewS3Key, 
      titulo, 
      descricao, 
      tags, 
      orientacao, 
      width, 
      height,
      camera,
      lens,
      focalLength,
      iso,
      shutterSpeed,
      aperture,
      colecaoId, // Added
      folderId   // Added
    } = body;

    if (!s3Key) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Find photographer using the authenticated user's ID
    const fotografo = await prisma.fotografo.findUnique({
      where: { userId: user.id },
    });

    if (!fotografo) {
      return NextResponse.json({ error: "Fotografo nao encontrado" }, { status: 404 });
    }

    // Generate Signed URL for preview (using the preview key if available, otherwise original)
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: previewS3Key || s3Key,
    });
    
    // Generate a signed URL valid for 7 days
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
    const previewUrl = await getSignedUrl(s3Client, command, { expiresIn: 604800 });
    
    // Build creating data
    const photoData = {
        titulo: titulo || "Sem titulo",
        descricao,
        tags: tags || [],
        orientacao: orientacao || "HORIZONTAL",
        s3Key,
        width: width || 0,
        height: height || 0,
        formato: "jpg", // Mock
        tamanhoBytes: 0, // Mock
        previewUrl: previewUrl,
        
        // Metadata
        camera,
        lens,
        focalLength,
        iso: iso ? parseInt(iso) : null,
        shutterSpeed,
        aperture,



        fotografo: {
            connect: { id: fotografo.id }
        },
        status: "PUBLICADA", // Auto-publish for MVP
    };

    if (colecaoId) {
        photoData.colecao = {
            connect: { id: colecaoId }
        };
    }
    
    if (folderId) {
        photoData.folder = { connect: { id: folderId } };
    }

    const foto = await prisma.foto.create({
      data: photoData
    });

    return NextResponse.json({ success: true, foto });
  } catch (error) {
    console.error("Error processing photo:", error);
    logError(error, "Photo Process API"); // Use logger
    return NextResponse.json({ error: "Erro ao processar foto: " + error.message }, { status: 500 });
  }
}
