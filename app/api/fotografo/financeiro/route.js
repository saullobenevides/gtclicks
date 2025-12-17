
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const fotografo = await prisma.fotografo.findUnique({
    where: { userId: user.id },
  });

  if (!fotografo) {
    return NextResponse.json({ error: "Perfil de fotografo nao encontrado" }, { status: 403 });
  }

  try {
    // Fetch Balance
    const saldo = await prisma.saldo.upsert({
      where: { fotografoId: fotografo.id },
      create: {
        fotografoId: fotografo.id,
        disponivel: 0,
        bloqueado: 0,
      },
      update: {},
    });

    // Fetch Recent Transactions (Limit 10)
    const transacoes = await prisma.transacao.findMany({
      where: { fotografoId: fotografo.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      saldo: {
        disponivel: Number(saldo.disponivel),
        bloqueado: Number(saldo.bloqueado),
      },
      transacoes: transacoes.map(t => ({
        ...t,
        valor: Number(t.valor)
      })),
    });
  } catch (error) {
    console.error("Financial API error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados financeiros" },
      { status: 500 }
    );
  }
}
