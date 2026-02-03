import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/auth";

export async function PATCH(request, { params }) {
  // Verify admin access
  const user = await getAuthenticatedUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Acesso não autorizado" },
      { status: 403 }
    );
  }

  const { id } = params;

  try {
    const body = await request.json();
    const { action } = body; // "aprovar" or "cancelar"

    if (!["aprovar", "cancelar"].includes(action)) {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    const saque = await prisma.solicitacaoSaque.findUnique({
      where: { id },
      include: { fotografo: { select: { userId: true } } },
    });

    if (!saque) {
      return NextResponse.json(
        { error: "Saque não encontrado" },
        { status: 404 }
      );
    }

    if (saque.status !== "PENDENTE") {
      return NextResponse.json(
        { error: "Saque já foi processado" },
        { status: 400 }
      );
    }

    if (action === "aprovar") {
      // Sistema migrado para Stripe: saques são automáticos via Stripe Connect.
      // Saques antigos (SolicitacaoSaque) não podem mais ser processados via PIX manual.
      return NextResponse.json(
        {
          error:
            "Sistema migrado para Stripe. Os repasses aos fotógrafos são feitos automaticamente. Para saques antigos pendentes, cancele e oriente o fotógrafo a usar o painel Stripe.",
        },
        { status: 400 }
      );
    }

    if (action === "cancelar") {
      // Mark as cancelled logic wrapped in transaction
      await prisma.$transaction(async (tx) => {
        // 1. Cancel request
        await tx.solicitacaoSaque.update({
          where: { id },
          data: {
            status: "CANCELADO",
            processadoEm: new Date(),
            observacao: "Saque cancelado pelo administrador",
          },
        });

        // 2. Update transaction status
        await tx.transacao.updateMany({
          where: {
            saqueId: id,
            tipo: "SAQUE",
          },
          data: {
            status: "FALHOU",
          },
        });

        // 3. Return money: blocked -> available
        const valorSaque = new Prisma.Decimal(saque.valor);

        await tx.saldo.update({
          where: { fotografoId: saque.fotografoId },
          data: {
            bloqueado: {
              decrement: valorSaque,
            },
            disponivel: {
              increment: valorSaque,
            },
          },
        });
      });

      // --- NOTIFICATION: Withdrawal Rejected ---
      try {
        const { notifyWithdrawalProcessed } = await import(
          "@/actions/notifications"
        );
        await notifyWithdrawalProcessed({
          userId: saque.fotografo.userId,
          value: Number(saque.valor),
          status: "REJEITADO",
        });
      } catch (nErr) {
        console.error(
          "Failed to send withdrawal rejection notification:",
          nErr
        );
      }

      console.log(
        `❌ Saque ${id} cancelado: R$ ${saque.valor} devolvido ao saldo`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return NextResponse.json(
      { error: "Erro ao processar saque" },
      { status: 500 }
    );
  }
}
