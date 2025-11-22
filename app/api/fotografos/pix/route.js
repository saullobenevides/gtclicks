import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, chavePix } = body;

    if (!userId || !chavePix) {
      return NextResponse.json(
        { error: "userId e chavePix são obrigatórios" },
        { status: 400 }
      );
    }

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

    // Update or create balance with PIX key
    const saldo = await prisma.saldo.upsert({
      where: { fotografoId: fotografo.id },
      create: {
        fotografoId: fotografo.id,
        disponivel: 0,
        bloqueado: 0,
        chavePix,
      },
      update: {
        chavePix,
      },
    });

    return NextResponse.json({ data: saldo });
  } catch (error) {
    console.error("Error updating PIX key:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar chave PIX" },
      { status: 500 }
    );
  }
}
