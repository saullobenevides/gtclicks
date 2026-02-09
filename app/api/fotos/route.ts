import { OrientacaoFoto } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  try {
    const fotos = await prisma.foto.findMany({
      where: { status: "PUBLICADA" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        titulo: true,
        previewUrl: true,
        fotografo: {
          select: { user: { select: { name: true } } },
        },
        licencas: {
          select: {
            licencaId: true,
            preco: true,
            licenca: { select: { nome: true } },
          },
        },
      },
    });

    return NextResponse.json({
      data: fotos.map((foto) => ({
        id: foto.id,
        titulo: foto.titulo,
        previewUrl: foto.previewUrl,
        fotografo: foto.fotografo?.user?.name ?? "Fotografo GTClicks",
        licencas: foto.licencas.map((item) => ({
          licencaId: item.licencaId,
          nome: item.licenca.nome,
          preco: item.preco.toNumber(),
        })),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Nao foi possivel listar as fotos.", details: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    const payload = (await request.json()) as {
      titulo?: string;
      slug?: string;
      descricao?: string;
      orientacao?: string;
      corPredominante?: string;
      previewUrl?: string;
      originalUrl?: string;
      colecaoId?: string;
    };

    const {
      titulo,
      descricao,
      orientacao = OrientacaoFoto.HORIZONTAL,
      previewUrl,
      originalUrl,
      colecaoId,
    } = payload;

    if (!titulo || !previewUrl || !originalUrl) {
      return NextResponse.json(
        {
          error: "Campos obrigatorios: titulo, previewUrl, originalUrl.",
        },
        { status: 400 }
      );
    }

    if (colecaoId) {
      const colecao = await prisma.colecao.findUnique({
        where: { id: colecaoId },
        select: { fotografoId: true },
      });
      if (!colecao || colecao.fotografoId !== fotografo.id) {
        return NextResponse.json(
          { error: "Coleção inválida ou sem permissão" },
          { status: 403 }
        );
      }
    }

    const s3Key =
      typeof originalUrl === "string" && !originalUrl.startsWith("http")
        ? originalUrl
        : `legacy/${Date.now()}-${titulo.slice(0, 20).replace(/\s/g, "-")}`;

    const normalizedOrientation =
      typeof orientacao === "string" ? orientacao.toUpperCase() : orientacao;
    const orientationValue = Object.values(OrientacaoFoto).includes(
      normalizedOrientation as OrientacaoFoto
    )
      ? (normalizedOrientation as OrientacaoFoto)
      : OrientacaoFoto.HORIZONTAL;

    const novaFoto = await prisma.foto.create({
      data: {
        titulo,
        descricao: descricao ?? null,
        orientacao: orientationValue,
        previewUrl,
        s3Key,
        width: 0,
        height: 0,
        formato: "jpg",
        tamanhoBytes: 0,
        fotografo: { connect: { id: fotografo.id } },
        ...(colecaoId ? { colecao: { connect: { id: colecaoId } } } : {}),
      },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        orientacao: true,
        previewUrl: true,
        colecaoId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: novaFoto }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Erro ao salvar a foto.", details: message },
      { status: 500 }
    );
  }
}
