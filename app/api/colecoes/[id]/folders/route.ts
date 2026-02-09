import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";

export async function GET(
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

  const colecao = await prisma.colecao.findUnique({
    where: { id: colecaoId },
    include: { fotografo: true },
  });

  if (!colecao || colecao.fotografo.userId !== user.id) {
    return NextResponse.json(
      { error: "Coleção não encontrada ou sem permissão" },
      { status: 403 }
    );
  }

  try {
    const fotos = await prisma.foto.findMany({
      where: { colecaoId },
      select: { folder: true },
    });

    const folderSet = new Set<string>();
    fotos.forEach((foto) => {
      const folder = foto.folder;
      const path =
        folder && typeof folder === "object" && "nome" in folder
          ? (folder as { nome: string }).nome
          : typeof folder === "string"
          ? folder
          : "";
      if (path) {
        const parts = path.split("/").filter((p) => p);
        let currentPath = "";
        for (const part of parts) {
          currentPath += `/${part}`;
          folderSet.add(currentPath);
        }
      }
    });

    const folders = Array.from(folderSet).sort();

    return NextResponse.json({ data: folders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Erro ao buscar pastas da coleção:", error);
    return NextResponse.json(
      { error: "Nao foi possivel buscar as pastas.", details: message },
      { status: 500 }
    );
  }
}
