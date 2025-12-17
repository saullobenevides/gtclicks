import { OrientacaoFoto } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logError } from "@/lib/logger";

import { photoBatchSchema } from "@/lib/validations";

function resolveOrientation(value) {
  if (!value) return OrientacaoFoto.HORIZONTAL;
  const normalized = value.toString().toUpperCase();
  return Object.prototype.hasOwnProperty.call(OrientacaoFoto, normalized)
    ? normalized
    : OrientacaoFoto.HORIZONTAL;
}

import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const fotografo = await prisma.fotografo.findUnique({
    where: { userId: user.id },
  });

  if (!fotografo) {
    return NextResponse.json({ error: "Perfil de fotografo nao encontrado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validation = photoBatchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.format() },
        { status: 400 }
      );
    }

    const {
      fotografoId,
      fotos = [],
      deletedPhotoIds = []
    } = validation.data;

    if (!fotografoId) {
      return NextResponse.json(
        { error: "Informe o fotografoId." },
        { status: 400 }
      );
    }

    if (fotografoId !== fotografo.id) {
        return NextResponse.json(
            { error: "Voce nao tem permissao para alterar fotos de outro fotografo." },
            { status: 403 }
        );
    }

    // Delete removed photos
    if (deletedPhotoIds.length > 0) {
      await prisma.foto.deleteMany({
        where: {
          id: { in: deletedPhotoIds },
          fotografoId: fotografoId // Security check: ensure they belong to this photographer
        }
      });
    }

    if ((!Array.isArray(fotos) || fotos.length === 0) && deletedPhotoIds.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma alteração enviada." },
        { status: 400 }
      );
    }

    const processedFotos = [];

    for (const foto of fotos) {
      // Common data supported by the current schema
      const commonData = {
        titulo: foto.titulo || "Foto sem titulo",
        descricao: foto.descricao,
        tags: Array.isArray(foto.tags)
          ? foto.tags
          : typeof foto.tags === "string" && foto.tags.length
          ? foto.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
          : [],
        orientacao: resolveOrientation(foto.orientacao),
        folderId: foto.folderId || null, // Handle folderId
        status: "PUBLICADA", // Auto-publish for MVP
      };

      let processedFoto;

      if (foto.id) {
        // Update existing photo
        processedFoto = await prisma.foto.update({
          where: { id: foto.id },
          data: {
            ...commonData,
            licencas: {
              deleteMany: {}, // Clear existing licenses
              create: foto.licencas?.map(l => ({
                licencaId: l.licencaId,
                preco: parseFloat(l.preco)
              })) || []
            }
          },
        });
      } else {
        // Create new photo
        if (!foto.s3Key) {
           // Skip invalid photos without s3Key
           continue;
        }
        
        // Generate Signed URL for preview
        const { S3Client, GetObjectCommand, HeadObjectCommand } = await import("@aws-sdk/client-s3");
        const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
        
        const s3Client = new S3Client({
          region: process.env.S3_UPLOAD_REGION,
          credentials: {
            accessKeyId: process.env.S3_UPLOAD_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_UPLOAD_SECRET_ACCESS_KEY,
          },
        });

        // Anti-Fraud: Verify S3 Object Existence
        try {
          await s3Client.send(new HeadObjectCommand({
            Bucket: process.env.S3_UPLOAD_BUCKET,
            Key: foto.s3Key,
          }));
        } catch (error) {
          console.error(`Fraud Check Failed: Object not found in S3 (${foto.s3Key})`);
          // Skip creation for non-existent files
          continue;
        }

        const command = new GetObjectCommand({
          Bucket: process.env.S3_UPLOAD_BUCKET,
          Key: foto.s3Key,
        });

        const previewUrl = await getSignedUrl(s3Client, command, { expiresIn: 604800 });

        processedFoto = await prisma.foto.create({
          data: {
            ...commonData,
            s3Key: foto.s3Key,
            previewUrl: previewUrl,
            width: foto.width || 0,
            height: foto.height || 0,
            formato: "jpg", // Default/Mock
            tamanhoBytes: 0, // Default/Mock
            fotografo: {
                connect: { id: fotografoId }
            },
            licencas: {
              create: foto.licencas?.map(l => ({
                licencaId: l.licencaId,
                preco: parseFloat(l.preco)
              })) || []
            }
          },
        });
      }

      processedFotos.push(processedFoto);
    }

    return NextResponse.json({
      data: processedFotos,
    });
  } catch (error) {
    console.error("Batch error:", error);
    logError(error, "Batch API");
    return NextResponse.json(
      { error: "Nao foi possivel salvar as fotos.", details: error.message },
      { status: 500 }
    );
  }
}
