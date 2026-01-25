import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const userId = user.id; // STRICTLY use authenticated ID

  try {
    // Get photographer
    const fotografo = await prisma.fotografo.findUnique({
      where: { userId },
    });

    if (!fotografo) {
      return NextResponse.json(
        { error: "Fotografo não encontrado" },
        { status: 404 },
      );
    }

    // Get or create balance
    const saldo = await prisma.saldo.upsert({
      where: { fotografoId: fotografo.id },
      create: {
        fotografoId: fotografo.id,
        disponivel: 0,
        bloqueado: 0,
      },
      update: {},
    });

    // Get transactions
    const transacoes = await prisma.transacao.findMany({
      where: { fotografoId: fotografo.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      saldo,
      transacoes,
    });
  } catch (error) {
    console.error("Error fetching financial data:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados financeiros" },
      { status: 500 },
    );
  }
}
