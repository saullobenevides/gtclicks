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
import { deleteManyPhotoFiles } from "@/lib/s3-delete";

export async function POST(request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const fotografo = await prisma.fotografo.findUnique({
    where: { userId: user.id },
  });

  if (!fotografo) {
    return NextResponse.json(
      { error: "Perfil de fotografo nao encontrado" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const validation = photoBatchSchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.format();
      const msg = Object.entries(details)
        .filter(([k]) => k !== "_errors")
        .map(([k, v]) =>
          typeof v === "object" ? `${k}: ${JSON.stringify(v)}` : `${k}: ${v}`
        )
        .join("; ");
      return NextResponse.json(
        { error: msg || "Dados inválidos", details },
        { status: 400 }
      );
    }

    const { fotografoId, fotos = [], deletedPhotoIds = [] } = validation.data;

    if (!fotografoId) {
      return NextResponse.json(
        { error: "Informe o fotografoId." },
        { status: 400 }
      );
    }

    if (fotografoId !== fotografo.id) {
      return NextResponse.json(
        {
          error:
            "Voce nao tem permissao para alterar fotos de outro fotografo.",
        },
        { status: 403 }
      );
    }

    // Delete removed photos
    if (deletedPhotoIds.length > 0) {
      try {
        console.log(
          `[Batch API] Processing ${deletedPhotoIds.length} deletions/unlinks`
        );

        for (const photoId of deletedPhotoIds) {
          // Verify ownership and check for dependencies
          const photo = await prisma.foto.findFirst({
            where: {
              id: photoId,
              fotografoId: fotografoId,
            },
            include: {
              _count: {
                select: { itensPedido: true },
              },
            },
          });

          if (!photo) continue;

          if (photo._count.itensPedido > 0) {
            // Soft unlink: remove from collection/folder but keep record for order history
            console.log(`[Batch API] Soft unlinking sold photo: ${photoId}`);
            await prisma.foto.update({
              where: { id: photoId },
              data: {
                colecaoId: null,
                folderId: null,
              },
            });
          } else {
            // Hard delete: remove from DB and cleanup S3
            console.log(`[Batch API] Hard deleting photo: ${photoId}`);
            if (photo.s3Key) {
              await deleteManyPhotoFiles([photo.s3Key]).catch((err) => {
                console.error(
                  `[Batch API] S3 deletion failed for ${photoId}:`,
                  err
                );
              });
            }

            await prisma.foto.delete({
              where: { id: photoId },
            });
          }
        }
      } catch (deletionError) {
        console.error(
          "[Batch API] Error during photo deletion process:",
          deletionError
        );
        throw deletionError;
      }
    }

    if (
      (!Array.isArray(fotos) || fotos.length === 0) &&
      deletedPhotoIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Nenhuma alteração enviada." },
        { status: 400 }
      );
    }

    const processedFotos = [];

    // Get the collectionId from the first photo or the common context
    const targetCollectionId = fotos[0]?.colecaoId || null;

    // Get the current max sequential number for this specific collection (or photographer if no collection)
    const lastPhoto = await prisma.foto.findFirst({
      where: targetCollectionId
        ? { colecaoId: targetCollectionId }
        : { fotografoId },
      orderBy: { numeroSequencial: "desc" },
      select: { numeroSequencial: true },
    });

    let nextNumber = (lastPhoto?.numeroSequencial || 0) + 1;

    // Fetch a default license in case one isn't provided (User: "all photos have the same license")
    const defaultLicenca = await prisma.licenca.findFirst();

    for (const foto of fotos) {
      const currentCollectionId = foto.colecaoId || targetCollectionId;

      const photoLicencas =
        foto.licencas && foto.licencas.length > 0
          ? foto.licencas
          : defaultLicenca
          ? [{ licencaId: defaultLicenca.id, preco: 0 }]
          : [];

      const commonData = {
        titulo:
          foto.titulo || `Foto #${nextNumber.toString().padStart(3, "0")}`,
        descricao: foto.descricao,
        orientacao: resolveOrientation(foto.orientacao),
        status: "PUBLICADA",
        numeroSequencial: foto.numeroSequencial || nextNumber++,
        dataCaptura: foto.dataCaptura || undefined,
        camera: foto.camera || undefined,
        lens: foto.lens || undefined,
        iso: foto.iso || undefined,
        shutterSpeed: foto.shutterSpeed || undefined,
        aperture: foto.aperture || undefined,
        colecao: currentCollectionId
          ? { connect: { id: currentCollectionId } }
          : undefined,
        folder: foto.folderId
          ? { connect: { id: foto.folderId } }
          : foto.id
          ? { disconnect: true }
          : undefined,
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
              create:
                photoLicencas.map((l) => ({
                  licencaId: l.licencaId,
                  preco: parseFloat(l.preco) || 0,
                })) || [],
            },
          },
        });
      } else {
        // Create new photo
        if (!foto.s3Key) {
          // Skip invalid photos without s3Key
          continue;
        }

        // Generate Signed URL for preview
        const { S3Client, GetObjectCommand, HeadObjectCommand } = await import(
          "@aws-sdk/client-s3"
        );
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
          await s3Client.send(
            new HeadObjectCommand({
              Bucket: process.env.S3_UPLOAD_BUCKET,
              Key: foto.s3Key,
            })
          );
        } catch (error) {
          console.error(
            `Fraud Check Failed: Object not found in S3 (${foto.s3Key})`
          );
          // Skip creation for non-existent files
          continue;
        }

        // Use a permanent proxy URL instead of a signed URL that expires
        const previewUrl = `/api/images/${foto.s3Key}`;

        // Verify existence logic (HeadObject) remains to ensure file exists before saving record
        // ... (The HEAD check is good, keep it if not removed by this block replacement)

        processedFoto = await prisma.foto.create({
          data: {
            ...commonData,
            s3Key: foto.s3Key,
            previewUrl: previewUrl,
            width: typeof foto.width === "number" ? foto.width : 0, // Ensure strictly number
            height: typeof foto.height === "number" ? foto.height : 0,
            formato: "jpg", // Default/Mock
            tamanhoBytes: 0, // Default/Mock
            fotografo: {
              connect: { id: fotografoId },
            },
            licencas: {
              create:
                photoLicencas.map((l) => ({
                  licencaId: l.licencaId,
                  preco: parseFloat(l.preco) || 0,
                })) || [],
            },
          },
        });
      }

      processedFotos.push(processedFoto);
    }

    // Não expor s3Key no cliente (Manual v3.0). Retornar apenas campos seguros para a UI.
    const safeData = processedFotos.map((f) => ({
      id: f.id,
      titulo: f.titulo,
      descricao: f.descricao,
      orientacao: f.orientacao,
      previewUrl: f.previewUrl,
      folderId: f.folderId,
      colecaoId: f.colecaoId,
      sequentialId: f.sequentialId,
      numeroSequencial: f.numeroSequencial,
      createdAt: f.createdAt,
    }));

    return NextResponse.json({
      data: safeData,
    });
  } catch (error) {
    console.error("[Batch API Error]:", error);
    try {
      const fs = await import("fs");
      const logMsg = `\n--- ${new Date().toISOString()} ---\nError: ${
        error.message
      }\nStack: ${error.stack}\n`;
      fs.appendFileSync("batch_error_debug.log", logMsg);
    } catch (e) {
      // ignore log error
    }
    logError(error, "Batch API");
    return NextResponse.json(
      {
        error: "Nao foi possivel salvar as fotos.",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
