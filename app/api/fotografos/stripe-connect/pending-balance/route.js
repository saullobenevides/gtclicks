import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * GET /api/fotografos/stripe-connect/pending-balance
 * Retorna saldo e transações do banco quando fotógrafo ainda não tem Stripe.
 */
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const fotografo = await prisma.fotografo.findUnique({
      where: { userId: user.id },
      include: { saldo: true },
    });

    if (!fotografo) {
      return NextResponse.json(
        { error: "Perfil de fotógrafo não encontrado" },
        { status: 404 }
      );
    }

    const transacoes = await prisma.transacao.findMany({
      where: { fotografoId: fotografo.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const saldo = fotografo.saldo || {
      disponivel: 0,
      bloqueado: 0,
    };

    const pendingTransfersCount = await prisma.pendingTransfer.count({
      where: {
        fotografoId: fotografo.id,
        processedAt: null,
      },
    });

    const pendingTransfersSum = await prisma.pendingTransfer.aggregate({
      where: {
        fotografoId: fotografo.id,
        processedAt: null,
      },
      _sum: { amountCents: true },
    });

    return NextResponse.json({
      saldo: {
        disponivel: Number(saldo.disponivel),
        bloqueado: Number(saldo.bloqueado),
      },
      transacoes: transacoes.map((t) => ({
        id: t.id,
        valor: Number(t.valor),
        tipo: t.tipo,
        descricao: t.descricao,
        createdAt: t.createdAt,
      })),
      pendingTransfers: {
        count: pendingTransfersCount,
        totalCents: pendingTransfersSum._sum.amountCents || 0,
      },
    });
  } catch (error) {
    console.error("[pending-balance]", error);
    return NextResponse.json(
      { error: "Erro ao buscar saldo pendente" },
      { status: 500 }
    );
  }
}
