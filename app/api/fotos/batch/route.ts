import { OrientacaoFoto } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { photoBatchSchema } from "@/lib/validations";
import { getAuthenticatedUser } from "@/lib/auth";
import { deleteManyPhotoFiles } from "@/lib/s3-delete";

function resolveOrientation(value: unknown): OrientacaoFoto {
  if (!value) return OrientacaoFoto.HORIZONTAL;
  const normalized = String(value).toUpperCase();
  return Object.prototype.hasOwnProperty.call(OrientacaoFoto, normalized)
    ? (normalized as OrientacaoFoto)
    : OrientacaoFoto.HORIZONTAL;
}

export async function POST(request: Request) {
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
    const body = (await request.json()) as unknown;
    const validation = photoBatchSchema.safeParse(body);

    if (!validation.success) {
      const details = validation.error.format();
      const msg = Object.entries(details)
        .filter(([k]) => k !== "_errors")
        .map(([k, v]) =>
          typeof v === "object"
            ? `${k}: ${JSON.stringify(v)}`
            : `${k}: ${String(v)}`
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

    if (deletedPhotoIds.length > 0) {
      try {
        console.log(
          `[Batch API] Processing ${deletedPhotoIds.length} deletions/unlinks`
        );

        for (const photoId of deletedPhotoIds) {
          const photo = await prisma.foto.findFirst({
            where: {
              id: photoId,
              fotografoId,
            },
            include: {
              _count: {
                select: { itensPedido: true },
              },
            },
          });

          if (!photo) continue;

          if (photo._count.itensPedido > 0) {
            console.log(`[Batch API] Soft unlinking sold photo: ${photoId}`);
            await prisma.foto.update({
              where: { id: photoId },
              data: {
                colecaoId: null,
                folderId: null,
              },
            });
          } else {
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

    const processedFotos: Array<{
      id: string;
      titulo: string;
      descricao: string | null;
      orientacao: OrientacaoFoto;
      previewUrl: string;
      folderId: string | null;
      colecaoId: string | null;
      sequentialId: number;
      numeroSequencial: number | null;
      createdAt: Date;
    }> = [];

    const targetCollectionId = fotos[0]?.colecaoId ?? null;

    const lastPhoto = await prisma.foto.findFirst({
      where: targetCollectionId
        ? { colecaoId: targetCollectionId }
        : { fotografoId },
      orderBy: { numeroSequencial: "desc" },
      select: { numeroSequencial: true },
    });

    let nextNumber = (lastPhoto?.numeroSequencial ?? 0) + 1;

    const defaultLicenca = await prisma.licenca.findFirst();

    for (const foto of fotos) {
      const currentCollectionId = foto.colecaoId ?? targetCollectionId;

      const photoLicencas =
        foto.licencas && foto.licencas.length > 0
          ? foto.licencas
          : defaultLicenca
          ? [{ licencaId: defaultLicenca.id, preco: 0 }]
          : [];

      const commonData = {
        titulo:
          foto.titulo ?? `Foto #${nextNumber.toString().padStart(3, "0")}`,
        descricao: foto.descricao ?? null,
        orientacao: resolveOrientation(foto.orientacao),
        status: "PUBLICADA" as const,
        numeroSequencial: foto.numeroSequencial ?? nextNumber++,
        dataCaptura: foto.dataCaptura ? new Date(foto.dataCaptura) : undefined,
        camera: foto.camera ?? undefined,
        lens: foto.lens ?? undefined,
        iso: foto.iso ?? undefined,
        shutterSpeed: foto.shutterSpeed ?? undefined,
        aperture: foto.aperture ?? undefined,
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
        processedFoto = await prisma.foto.update({
          where: { id: foto.id },
          data: {
            ...commonData,
            licencas: {
              deleteMany: {},
              create:
                photoLicencas.map((l) => ({
                  licencaId: l.licencaId,
                  preco: parseFloat(String(l.preco)) || 0,
                })) ?? [],
            },
          },
        });
      } else {
        if (!foto.s3Key) {
          continue;
        }

        const { S3Client, GetObjectCommand, HeadObjectCommand } = await import(
          "@aws-sdk/client-s3"
        );

        const s3Client = new S3Client({
          region: process.env.S3_UPLOAD_REGION,
          credentials: {
            accessKeyId: process.env.S3_UPLOAD_ACCESS_KEY_ID ?? "",
            secretAccessKey: process.env.S3_UPLOAD_SECRET_ACCESS_KEY ?? "",
          },
        });

        try {
          await s3Client.send(
            new HeadObjectCommand({
              Bucket: process.env.S3_UPLOAD_BUCKET,
              Key: foto.s3Key,
            })
          );
        } catch {
          console.error(
            `Fraud Check Failed: Object not found in S3 (${foto.s3Key})`
          );
          continue;
        }

        const { processUploadedImage } = await import("@/lib/processing");
        let previewUrl: string;
        try {
          const processResult = await processUploadedImage(
            foto.s3Key,
            `batch-${Date.now()}-${nextNumber}`
          );
          previewUrl = processResult.previewUrl;
        } catch (procErr) {
          console.error(
            `[Batch] Watermark processing failed for ${foto.s3Key}:`,
            procErr instanceof Error ? procErr.message : String(procErr)
          );
          continue;
        }

        processedFoto = await prisma.foto.create({
          data: {
            ...commonData,
            s3Key: foto.s3Key,
            previewUrl,
            width: typeof foto.width === "number" ? foto.width : 0,
            height: typeof foto.height === "number" ? foto.height : 0,
            formato: "jpg",
            tamanhoBytes: 0,
            fotografo: { connect: { id: fotografoId } },
            licencas: {
              create: photoLicencas.map((l) => ({
                licencaId: l.licencaId,
                preco: parseFloat(String(l.preco)) || 0,
              })),
            },
          },
        });
      }

      processedFotos.push(processedFoto);
    }

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

    return NextResponse.json({ data: safeData });
  } catch (error) {
    console.error("[Batch API Error]:", error);
    try {
      const fs = await import("fs");
      const err = error instanceof Error ? error : new Error(String(error));
      const logMsg = `\n--- ${new Date().toISOString()} ---\nError: ${
        err.message
      }\nStack: ${err.stack}\n`;
      fs.appendFileSync("batch_error_debug.log", logMsg);
    } catch {
      // ignore log error
    }
    logError(
      error instanceof Error ? error : new Error(String(error)),
      "Batch API"
    );
    return NextResponse.json(
      {
        error: "Nao foi possivel salvar as fotos.",
        details: error instanceof Error ? error.message : String(error),
        stack:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 500 }
    );
  }
}
