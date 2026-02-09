import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  requireAdminApi,
  logAdminActivity,
} from "@/lib/admin/permissions";
import {
  processPayoutForSaque,
  retryPayoutForSaque,
} from "@/lib/payouts";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as { action?: string };
    const { action } = body;

    if (
      !["aprovar", "cancelar", "reprocessar", "confirmar_manual"].includes(
        action || ""
      )
    ) {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    const saque = await prisma.solicitacaoSaque.findUnique({
      where: { id },
      include: { fotografo: { select: { userId: true, username: true } } },
    });

    if (!saque) {
      return NextResponse.json(
        { error: "Saque não encontrado" },
        { status: 404 }
      );
    }

    if (action === "reprocessar") {
      if (saque.status !== "FALHOU") {
        return NextResponse.json(
          { error: "Apenas saques com falha podem ser reprocessados" },
          { status: 400 }
        );
      }
      const result = await retryPayoutForSaque(id);
      if (result.success) {
        await logAdminActivity(auth.admin.id, "PAYOUT_RETRIED", "SolicitacaoSaque", id, {
          valor: Number(saque.valor),
          fotografoUsername: saque.fotografo?.username,
        });
        return NextResponse.json({ success: true });
      }
      return NextResponse.json(
        { error: result.error || "Falha ao reprocessar" },
        { status: 400 }
      );
    }

    if (saque.status !== "PENDENTE") {
      return NextResponse.json(
        { error: "Saque já foi processado" },
        { status: 400 }
      );
    }

    if (action === "confirmar_manual") {
      if (saque.status !== "PENDENTE") {
        return NextResponse.json(
          { error: "Apenas saques pendentes podem ser confirmados manualmente" },
          { status: 400 }
        );
      }
      await prisma.$transaction(async (tx) => {
        await tx.solicitacaoSaque.update({
          where: { id },
          data: {
            status: "PROCESSADO",
            processadoEm: new Date(),
            observacao: "Processado manualmente via PIX",
          },
        });
        await tx.transacao.updateMany({
          where: { saqueId: id, tipo: "SAQUE" },
          data: { status: "PROCESSADO" },
        });
        const valorSaque = new Prisma.Decimal(saque.valor);
        await tx.saldo.update({
          where: { fotografoId: saque.fotografoId },
          data: { bloqueado: { decrement: valorSaque } },
        });
      });
      try {
        const { notifyWithdrawalProcessed } = await import(
          "@/actions/notifications"
        );
        await notifyWithdrawalProcessed({
          userId: saque.fotografo.userId,
          value: Number(saque.valor),
          status: "APROVADO",
        });
      } catch (nErr) {
        console.error("Failed to send withdrawal notification:", nErr);
      }
      await logAdminActivity(auth.admin.id, "PAYOUT_MANUAL_CONFIRMED", "SolicitacaoSaque", id, {
        valor: Number(saque.valor),
        fotografoUsername: saque.fotografo?.username,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "aprovar") {
      const payoutResult = await processPayoutForSaque(id);
      if (!payoutResult.success) {
        return NextResponse.json(
          {
            error:
              payoutResult.error ||
              "Falha ao processar PIX. O saque permanece pendente.",
          },
          { status: 400 }
        );
      }
      if (payoutResult.manualRequired) {
        return NextResponse.json(
          {
            error:
              "O envio automático não está disponível. " +
              "Faça o PIX via app do MP e clique em 'Confirmar manual'.",
          },
          { status: 400 }
        );
      }
      await logAdminActivity(auth.admin.id, "PAYOUT_PROCESSED", "SolicitacaoSaque", id, {
        valor: Number(saque.valor),
        fotografoUsername: saque.fotografo?.username,
      });
    } else {
      await prisma.$transaction(async (tx) => {
        await tx.solicitacaoSaque.update({
          where: { id },
          data: {
            status: "CANCELADO",
            processadoEm: new Date(),
            observacao: "Saque cancelado pelo administrador",
          },
        });

        await tx.transacao.updateMany({
          where: { saqueId: id, tipo: "SAQUE" },
          data: { status: "FALHOU" },
        });

        const valorSaque = new Prisma.Decimal(saque.valor);

        await tx.saldo.update({
          where: { fotografoId: saque.fotografoId },
          data: {
            bloqueado: { decrement: valorSaque },
            disponivel: { increment: valorSaque },
          },
        });
      });

      await logAdminActivity(auth.admin.id, "PAYOUT_CANCELLED", "SolicitacaoSaque", id, {
        valor: Number(saque.valor),
        fotografoUsername: saque.fotografo?.username,
      });

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
