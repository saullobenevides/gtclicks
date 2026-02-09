import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";
import { slugify } from "@/lib/slug";

export async function POST() {
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
      { status: 403 }
    );
  }

  try {
    const uniqueSuffix = Date.now().toString(36);
    const defaultName = "Nova Coleção";
    const slug = `${slugify(defaultName)}-${uniqueSuffix}`;

    const colecao = await prisma.colecao.create({
      data: {
        nome: defaultName,
        slug,
        fotografoId: fotografo.id,
      },
    });

    return NextResponse.json({ data: colecao }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Erro ao criar rascunho de coleção:", error);
    return NextResponse.json(
      {
        error: "Nao foi possivel criar o rascunho da colecao.",
        details: message,
      },
      { status: 500 }
    );
  }
}
