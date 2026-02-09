import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ username: string }> }
) {
  const params = await context.params;
  const username = decodeURIComponent(params.username);

  if (!username) {
    return NextResponse.json(
      { error: "username is required" },
      { status: 400 }
    );
  }

  try {
    const fotografo = await prisma.fotografo.findUnique({
      where: { username },
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
        status: "PUBLICADA",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        titulo: true,
        previewUrl: true,
        orientacao: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: fotos });
  } catch (error) {
    console.error("Error fetching photographer photos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar fotos do fotógrafo" },
      { status: 500 }
    );
  }
}
