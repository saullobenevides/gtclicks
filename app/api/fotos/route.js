import { OrientacaoFoto } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const fotos = await prisma.foto.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        fotografo: { include: { user: true } },
        licencas: { include: { licenca: true } },
      },
    });

    return NextResponse.json({
      data: fotos.map((foto) => ({
        id: foto.id,
        titulo: foto.titulo,
        previewUrl: foto.previewUrl,
        tags: foto.tags,
        fotografo: foto.fotografo?.user?.name ?? "Fotografo GTClicks",
        licencas: foto.licencas.map((item) => ({
          licencaId: item.licencaId,
          nome: item.licenca.nome,
          preco: item.preco.toNumber(),
        })),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Nao foi possivel listar as fotos.", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const {
      titulo,
      slug,
      descricao,
      tags = [],
      orientacao = OrientacaoFoto.HORIZONTAL,
      corPredominante,
      previewUrl,
      originalUrl,
      fotografoId,
      colecaoId,
    } = payload;

    if (!titulo || !slug || !fotografoId || !previewUrl || !originalUrl) {
      return NextResponse.json(
        { error: "Campos obrigatorios: titulo, slug, fotografoId, previewUrl, originalUrl." },
        { status: 400 }
      );
    }

    const normalizedOrientation =
      typeof orientacao === "string" ? orientacao.toUpperCase() : orientacao;
    const orientationValue = Object.values(OrientacaoFoto).includes(normalizedOrientation)
      ? normalizedOrientation
      : OrientacaoFoto.HORIZONTAL;

    const novaFoto = await prisma.foto.create({
      data: {
        titulo,
        slug,
        descricao,
        tags,
        orientacao: orientationValue,
        corPredominante,
        previewUrl,
        originalUrl,
        fotografo: {
          connect: { id: fotografoId },
        },
        ...(colecaoId
          ? {
              colecao: {
                connect: { id: colecaoId },
              },
            }
          : {}),
      },
    });

    return NextResponse.json({ data: novaFoto }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao salvar a foto.", details: error.message },
      { status: 500 }
    );
  }
}
