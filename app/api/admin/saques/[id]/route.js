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
      { status: 403 },
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
        { status: 404 },
      );
    }

    if (saque.status !== "PENDENTE") {
      return NextResponse.json(
        { error: "Saque já foi processado" },
        { status: 400 },
      );
    }

    if (action === "aprovar") {
      // --- NEW: Automated Payout with Mercado Pago ---
      try {
        const { sendPixPayout } = await import("@/lib/mercadopago");
        const payoutResult = await sendPixPayout({
          amount: Number(saque.valor),
          pixKey: saque.chavePix,
          description: `Pagamento GT Clicks - Saque ${saque.id}`,
          externalReference: saque.id,
        });

        if (!payoutResult.success) {
          console.error(
            `❌ Automatic payout failed for ${saque.id}:`,
            payoutResult.error,
          );
          return NextResponse.json(
            {
              error: `Falha no Pix Automático: ${payoutResult.error}. O saque não foi processado no banco.`,
            },
            { status: 400 },
          );
        }

        console.log(
          `✅ Pix Automático enviado com sucesso para saque ${saque.id}. ID MP: ${payoutResult.id}`,
        );
      } catch (payoutErr) {
        console.error(`❌ Payout integration error:`, payoutErr);
        return NextResponse.json(
          {
            error:
              "Erro crítico ao tentar processar o Pix. Entre em contato com o suporte.",
          },
          { status: 500 },
        );
      }

      // Mark as processed logic wrapped in transaction
      await prisma.$transaction(async (tx) => {
        // 1. Mark withdrawal as processed
        await tx.solicitacaoSaque.update({
          where: { id },
          data: {
            status: "PROCESSADO",
            processadoEm: new Date(),
            observacao: "Saque processado via PIX Automático",
          },
        });

        // 2. Update transaction status
        await tx.transacao.updateMany({
          where: {
            saqueId: id,
            tipo: "SAQUE",
          },
          data: {
            status: "PROCESSADO",
          },
        });

        // 3. Move from blocked to paid (remove from balance)
        // Use Decimal for precision
        const valorSaque = new Prisma.Decimal(saque.valor);

        await tx.saldo.update({
          where: { fotografoId: saque.fotografoId },
          data: {
            bloqueado: {
              decrement: valorSaque,
            },
          },
        });
      });

      // --- NOTIFICATION: Withdrawal Approved ---
      try {
        const { notifyWithdrawalProcessed } =
          await import("@/actions/notifications");
        await notifyWithdrawalProcessed({
          userId: saque.fotografo.userId,
          value: Number(saque.valor),
          status: "APROVADO",
        });
      } catch (nErr) {
        console.error("Failed to send withdrawal approval notification:", nErr);
      }

      console.log(`✅ Saque ${id} aprovado: R$ ${saque.valor} processado`);
    } else {
      // Cancel withdrawal logic wrapped in transaction
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
        const { notifyWithdrawalProcessed } =
          await import("@/actions/notifications");
        await notifyWithdrawalProcessed({
          userId: saque.fotografo.userId,
          value: Number(saque.valor),
          status: "REJEITADO",
        });
      } catch (nErr) {
        console.error(
          "Failed to send withdrawal rejection notification:",
          nErr,
        );
      }

      console.log(
        `❌ Saque ${id} cancelado: R$ ${saque.valor} devolvido ao saldo`,
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return NextResponse.json(
      { error: "Erro ao processar saque" },
      { status: 500 },
    );
  }
}
