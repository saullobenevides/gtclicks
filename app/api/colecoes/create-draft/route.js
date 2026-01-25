import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";
import { slugify } from "@/lib/slug";

export async function POST(request) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const fotografo = await prisma.fotografo.findUnique({
    where: { userId: user.id },
  });

  if (!fotografo) {
    return NextResponse.json(
      { error: "Perfil de fotografo nao encontrado ou nao autorizado" },
      { status: 403 },
    );
  }

  try {
    // Generate a unique slug instantly without DB loops
    const uniqueSuffix = Date.now().toString(36);
    const defaultName = "Nova Coleção";
    const slug = `${slugify(defaultName)}-${uniqueSuffix}`;
    const finalName = defaultName;

    const colecao = await prisma.colecao.create({
      data: {
        nome: finalName,
        slug: slug,
        fotografoId: fotografo.id,
      },
    });

    return NextResponse.json({ data: colecao }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar rascunho de coleção:", error);
    return NextResponse.json(
      {
        error: "Nao foi possivel criar o rascunho da colecao.",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
