import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slug";

// GET with optional fotografoId filter
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const fotografoId = searchParams.get("fotografoId");

  try {
    const colecoes = await prisma.colecao.findMany({
      where: fotografoId ? { fotografoId } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: colecoes }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Nao foi possivel carregar as colecoes.", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { fotografoId, nome, descricao, capaUrl } = await request.json();

    if (!fotografoId || !nome) {
      return NextResponse.json(
        { error: "Informe fotografoId e nome da colecao." },
        { status: 400 }
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
        fotografoId,
      },
    });

    return NextResponse.json({ data: colecao }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Nao foi possivel criar a colecao.", details: error.message },
      { status: 500 }
    );
  }
}
