import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";

export async function GET(request, context) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const params = await context.params;
  const { id: colecaoId } = params;

  if (!colecaoId) {
    return NextResponse.json({ error: "ID da coleção é obrigatório" }, { status: 400 });
  }

  try {
    const fotos = await prisma.foto.findMany({
      where: { colecaoId },
      select: { folder: true },
    });

    const folderSet = new Set();
    fotos.forEach(foto => {
      if (foto.folder) {
        // Split path and add all parent paths
        const parts = foto.folder.split('/').filter(p => p);
        let currentPath = '';
        for (const part of parts) {
          currentPath += `/${part}`;
          folderSet.add(currentPath);
        }
      }
    });

    const folders = Array.from(folderSet).sort();

    return NextResponse.json({ data: folders });
  } catch (error) {
    console.error("Erro ao buscar pastas da coleção:", error);
    return NextResponse.json(
      { error: "Nao foi possivel buscar as pastas.", details: error.message },
      { status: 500 }
    );
  }
}
