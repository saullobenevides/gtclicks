import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, props) {
  const params = await props.params;
  const username = decodeURIComponent(params.username);

  console.log(`[API] Fetching photos for username: ${username}`);

  if (!username) {
    return NextResponse.json(
      { error: "username is required" },
      { status: 400 },
    );
  }

  try {
    // Get photographer by username
    const fotografo = await prisma.fotografo.findUnique({
      where: { username },
    });

    if (!fotografo) {
      return NextResponse.json(
        { error: "Fotógrafo não encontrado" },
        { status: 404 },
      );
    }

    // Get all public photos by this photographer
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
        orientacao: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ data: fotos });
  } catch (error) {
    console.error("Error fetching photographer photos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar fotos do fotógrafo" },
      { status: 500 },
    );
  }
}
