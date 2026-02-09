import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";
import { slugify } from "@/lib/slug";
import { deleteManyPhotoFiles } from "@/lib/s3-delete";
import { invalidate } from "@/lib/cache";

function parseDate(d: unknown): Date | null {
  if (!d) return null;
  const date = new Date(d as string);
  return isNaN(date.getTime()) ? null : date;
}

function parseMoney(v: unknown): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const floatVal = parseFloat(String(v));
  return isNaN(floatVal) ? undefined : floatVal;
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
    }

    const { id: colecaoId } = await context.params;
    if (!colecaoId) {
      return NextResponse.json(
        { error: "ID da coleção é obrigatório" },
        { status: 400 }
      );
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

    const body = (await request.json()) as {
      nome?: string;
      descricao?: string;
      categoria?: string;
      status?: string;
      precoFoto?: unknown;
      capaUrl?: string;
      cidade?: string;
      estado?: string;
      local?: string;
      dataInicio?: unknown;
      dataFim?: unknown;
      descontos?: unknown;
    };

    const colecao = await prisma.colecao.findUnique({
      where: { id: colecaoId },
    });

    if (!colecao || colecao.fotografoId !== fotografo.id) {
      return NextResponse.json(
        { error: "Coleção não encontrada ou não autorizada" },
        { status: 404 }
      );
    }

    let updatedSlug = colecao.slug;
    if (body.nome && slugify(body.nome) !== colecao.slug.replace(/-\d+$/, "")) {
      const baseSlug = slugify(body.nome);
      let slug = baseSlug;
      const count = await prisma.colecao.count({
        where: {
          slug: { startsWith: slug },
          NOT: { id: colecaoId },
        },
      });
      if (count > 0) {
        slug = `${baseSlug}-${count + 1}`;
      }
      updatedSlug = slug;
    }

    const updatedColecao = await prisma.colecao.update({
      where: { id: colecaoId },
      data: {
        nome: body.nome,
        descricao: body.descricao,
        categoria: body.categoria,
        capaUrl: body.capaUrl,
        slug: updatedSlug,
        status: body.status as "RASCUNHO" | "PUBLICADA" | undefined,
        precoFoto: parseMoney(body.precoFoto),
        cidade: body.cidade,
        estado: body.estado,
        local: body.local,
        dataInicio: parseDate(body.dataInicio),
        dataFim: parseDate(body.dataFim),
        descontos: body.descontos as Prisma.InputJsonValue | undefined,
      },
    });

    if (body.status === "PUBLICADA") {
      await invalidate("homepage:*");
      await invalidate("marketplace:distinct-cities");
      await invalidate("marketplace:distinct-photographer-cities");
      await invalidate("search:*");
    }

    return NextResponse.json({ data: updatedColecao });
  } catch (error) {
    console.error("Erro ao atualizar coleção:", error);
    return NextResponse.json(
      {
        error: "Erro ao atualizar coleção",
        ...(process.env.NODE_ENV === "development" && {
          details: error instanceof Error ? error.message : "Unknown error",
        }),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { id: colecaoId } = await context.params;

  if (!colecaoId) {
    return NextResponse.json(
      { error: "ID da coleção é obrigatório" },
      { status: 400 }
    );
  }

  try {
    const colecao = await prisma.colecao.findUnique({
      where: { id: colecaoId },
      select: { id: true, fotografo: { select: { userId: true } } },
    });

    if (!colecao || colecao.fotografo.userId !== user.id) {
      return NextResponse.json(
        { error: "Coleção não encontrada ou não autorizada" },
        { status: 404 }
      );
    }

    const photosToDelete = await prisma.foto.findMany({
      where: { colecaoId },
      select: { s3Key: true },
    });

    const s3KeysToDelete = photosToDelete
      .map((p) => p.s3Key)
      .filter((k): k is string => Boolean(k));

    await prisma.colecao.delete({
      where: { id: colecaoId },
    });

    if (s3KeysToDelete.length > 0) {
      await deleteManyPhotoFiles(s3KeysToDelete);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Erro ao deletar coleção ${colecaoId}:`, error);
    return NextResponse.json(
      {
        error: "Erro ao deletar coleção",
        ...(process.env.NODE_ENV === "development" && {
          details: error instanceof Error ? error.message : "Unknown error",
        }),
      },
      { status: 500 }
    );
  }
}
