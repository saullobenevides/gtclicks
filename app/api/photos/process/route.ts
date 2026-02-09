import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { processUploadedImage } from "@/lib/processing";
import { z } from "zod";

const processPhotoSchema = z.object({
  s3Key: z.string().min(1, "S3 Key é obrigatória"),
  colecaoId: z.string().cuid("ID de coleção inválido"),
  folderId: z.string().optional().nullable(),
  titulo: z.string().optional().nullable(),
  width: z.number().optional().default(0),
  height: z.number().optional().default(0),
  camera: z.string().optional().nullable(),
  lens: z.string().optional().nullable(),
  focalLength: z.string().optional().nullable(),
  iso: z.union([z.string(), z.number()]).optional().nullable(),
  shutterSpeed: z.string().optional().nullable(),
  aperture: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = (await request.json()) as unknown;
    const validation = processPhotoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

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
    } = validation.data;

    const fotografo = await prisma.fotografo.findUnique({
      where: { userId: user.id },
    });

    if (!fotografo) {
      return NextResponse.json(
        { error: "Fotógrafo não encontrado" },
        { status: 403 }
      );
    }

    const colecao = await prisma.colecao.findUnique({
      where: { id: colecaoId },
      select: { nome: true },
    });

    if (!colecao) {
      return NextResponse.json(
        { error: "Coleção não encontrada" },
        { status: 404 }
      );
    }

    const lastPhoto = await prisma.foto.findFirst({
      where: { colecaoId },
      orderBy: { numeroSequencial: "desc" },
      select: { numeroSequencial: true },
    });
    const nextSequentialNumber = (lastPhoto?.numeroSequencial ?? 0) + 1;

    const foto = await prisma.foto.create({
      data: {
        titulo: titulo ?? "Sem título",
        s3Key,
        width: width ?? 0,
        height: height ?? 0,
        formato: "jpg",
        tamanhoBytes: 0,
        previewUrl: "",
        camera: camera ?? undefined,
        lens: lens ?? undefined,
        focalLength: focalLength ?? undefined,
        iso: iso != null ? Number(iso) : null,
        shutterSpeed: shutterSpeed ?? undefined,
        aperture: aperture ?? undefined,
        orientacao: (width ?? 0) > (height ?? 0) ? "HORIZONTAL" : "VERTICAL",
        colecao: { connect: { id: colecaoId } },
        folder: folderId ? { connect: { id: folderId } } : undefined,
        fotografo: { connect: { id: fotografo.id } },
        status: "PENDENTE",
        indexingStatus: "PENDENTE",
        numeroSequencial: nextSequentialNumber,
      },
    });

    console.log(
      `[Process API] Created photo ${foto.id}, starting processing...`
    );

    let processResult;
    try {
      processResult = await processUploadedImage(s3Key, foto.id);
    } catch (procError) {
      const err =
        procError instanceof Error ? procError : new Error(String(procError));
      console.error(
        "Processing failed, rolling back photo creation",
        err.message
      );

      try {
        await prisma.foto.delete({ where: { id: foto.id } });
        console.log(`[Process API] Rollback successful for photo ${foto.id}`);
      } catch (rollbackError) {
        console.error(
          `[Process API] CRITICAL: Rollback failed for photo ${foto.id}`,
          rollbackError
        );
      }

      return NextResponse.json(
        {
          error: "Erro no processamento da imagem",
          details: err.message,
        },
        { status: 500 }
      );
    }

    const finalTitle =
      titulo && titulo.trim() !== "Sem título"
        ? titulo
        : `${colecao.nome ?? "Coleção"} IMG_${String(
            nextSequentialNumber
          ).padStart(4, "0")}`;

    const updatedFoto = await prisma.foto.update({
      where: { id: foto.id },
      data: {
        previewUrl: processResult.previewUrl,
        status: "PUBLICADA",
        titulo: finalTitle,
        dataCaptura: processResult.dataCaptura,
      },
      include: {
        colecao: {
          select: { faceRecognitionEnabled: true },
        },
      },
    });

    return NextResponse.json({
      message: "Processamento concluído",
      foto: updatedFoto,
    });
  } catch (error) {
    console.error("Critical error in process route:", error);
    return NextResponse.json(
      {
        error: "Erro interno no servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
