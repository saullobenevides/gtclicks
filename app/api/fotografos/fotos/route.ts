import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
  }

  try {
    const fotografo = await prisma.fotografo.findUnique({
      where: { userId: user.id },
    });

    if (!fotografo) {
      return NextResponse.json(
        { error: "Fotógrafo não encontrado" },
        { status: 404 }
      );
    }

    const fotos = await prisma.foto.findMany({
      where: {
        fotografoId: fotografo.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        titulo: true,
        previewUrl: true,
        licencas: {
          select: {
            licencaId: true,
            preco: true,
            licenca: { select: { id: true, nome: true } },
          },
        },
      },
    });

    return NextResponse.json({ data: fotos });
  } catch (error) {
    console.error("Error fetching photographer photos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar fotos" },
      { status: 500 }
    );
  }
}
