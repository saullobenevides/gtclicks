import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { invalidate } from "@/lib/cache";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fotografoId = searchParams.get("fotografoId");

  try {
    const colecoes = await prisma.colecao.findMany({
      where: {
        ...(fotografoId ? { fotografoId } : {}),
        status: "PUBLICADA",
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { data: colecoes },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Nao foi possivel carregar as colecoes.", details: message },
      { status: 500 }
    );
  }
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
    const body = (await request.json()) as {
      fotografoId?: string;
      nome?: string;
      descricao?: string;
      capaUrl?: string;
    };
    const { nome, descricao, capaUrl } = body;

    if (!nome) {
      return NextResponse.json(
        { error: "Informe o nome da colecao." },
        { status: 400 }
      );
    }

    if (body.fotografoId && body.fotografoId !== fotografo.id) {
      return NextResponse.json(
        {
          error:
            "Voce nao tem permissao para criar coleção para outro fotografo.",
        },
        { status: 403 }
      );
    }

    const baseSlug = slugify(nome);
    let slug = baseSlug;
    let suffix = 1;
    let exists = await prisma.colecao.findUnique({ where: { slug } });
    while (exists) {
      slug = `${baseSlug}-${suffix++}`;
      exists = await prisma.colecao.findUnique({ where: { slug } });
    }

    const colecao = await prisma.colecao.create({
      data: {
        nome,
        slug,
        descricao,
        capaUrl,
        fotografoId: fotografo.id,
      },
    });

    await invalidate("homepage:*");
    await invalidate("marketplace:distinct-cities");
    await invalidate("marketplace:distinct-photographer-cities");
    await invalidate("search:*");

    return NextResponse.json({ data: colecao }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Nao foi possivel criar a colecao.", details: message },
      { status: 500 }
    );
  }
}
