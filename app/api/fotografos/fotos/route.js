import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  try {
    // Get photographer
    const fotografo = await prisma.fotografo.findUnique({
      where: { userId },
    });

    if (!fotografo) {
      return NextResponse.json(
        { error: "Fotógrafo não encontrado" },
        { status: 404 }
      );
    }

    // Get all photos by this photographer
    const fotos = await prisma.foto.findMany({
      where: {
        fotografoId: fotografo.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        licencas: {
          include: {
            licenca: true,
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
