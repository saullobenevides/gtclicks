/**
 * Lógica de processamento de saques (PIX automático)
 * Usado tanto no fluxo automático quanto no retry manual do admin.
 *
 * Prioridade: Asaas (quando configurado) > processamento manual.
 */

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { sendPixTransfer, isAsaasConfigured } from "@/lib/asaas";
import { sendPixPayout } from "@/lib/mercadopago";

export interface ProcessPayoutResult {
  success: boolean;
  error?: string;
  /** Quando true, saque permanece PENDENTE para processamento manual pelo admin */
  manualRequired?: boolean;
}

/**
 * Processa um saque pendente: envia PIX via Asaas (se configurado) ou mantém para manual (MP).
 * - Sucesso: status PROCESSADO, decrementa bloqueado
 * - Falha: status FALHOU, reverte saldo (bloqueado → disponivel)
 * - manualRequired: saque permanece PENDENTE para processamento manual
 */
export async function processPayoutForSaque(
  saqueId: string
): Promise<ProcessPayoutResult> {
  const saque = await prisma.solicitacaoSaque.findUnique({
    where: { id: saqueId },
    include: {
      fotografo: {
        select: { userId: true, username: true },
      },
    },
  });

  if (!saque) {
    return { success: false, error: "Saque não encontrado" };
  }

  if (saque.status !== "PENDENTE") {
    return { success: false, error: "Saque já foi processado" };
  }

  if (!saque.chavePix) {
    return { success: false, error: "Chave PIX não cadastrada" };
  }

  let payoutResult: { success: boolean; error?: string; manualRequired?: boolean };

  if (isAsaasConfigured()) {
    const asaasResult = await sendPixTransfer({
      value: Number(saque.valor),
      pixAddressKey: saque.chavePix,
      pixAddressKeyType: "CPF", // App atualmente cadastra apenas CPF
      description: `Saque GT Clicks - ${saque.id}`,
    });
    payoutResult = {
      success: asaasResult.success,
      error: asaasResult.error,
      manualRequired: false,
    };
  } else {
    // Fallback: MP não suporta PIX payout via API → processamento manual
    payoutResult = await sendPixPayout({
      amount: Number(saque.valor),
      pixKey: saque.chavePix,
      description: `Pagamento GT Clicks - Saque ${saque.id}`,
      externalReference: saque.id,
    });
  }

  if (!payoutResult.success) {
    // manualRequired: quando MP é usado (Asaas não configurado), API MP não suporta PIX payout
    if (payoutResult.manualRequired) {
      await prisma.solicitacaoSaque.update({
        where: { id: saqueId },
        data: {
          observacao:
            "Aguardando processamento manual. Processe via app de transferência PIX. " +
            "Chave e valor exibidos na lista de saques.",
        },
      });
      // Retorna success: true para o fluxo do fotógrafo - saque foi criado e está pendente
      return {
        success: true,
        manualRequired: true,
        error:
          payoutResult.error ||
          "O saque será processado manualmente em até 24h.",
      };
    }

    console.error(`❌ Payout failed for ${saque.id}:`, payoutResult.error);

    await prisma.$transaction(async (tx) => {
      await tx.solicitacaoSaque.update({
        where: { id: saqueId },
        data: {
          status: "FALHOU",
          processadoEm: new Date(),
          observacao: payoutResult.error || "Falha ao enviar PIX",
        },
      });

      await tx.transacao.updateMany({
        where: { saqueId, tipo: "SAQUE" },
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

    try {
      const { notifyWithdrawalProcessed } = await import(
        "@/actions/notifications"
      );
      await notifyWithdrawalProcessed({
        userId: saque.fotografo!.userId,
        value: Number(saque.valor),
        status: "REJEITADO",
      });
    } catch (nErr) {
      console.error("Failed to send withdrawal failure notification:", nErr);
    }

    return {
      success: false,
      error: payoutResult.error || "Falha ao enviar PIX",
    };
  }

  const observacaoSucesso = isAsaasConfigured()
    ? "Saque processado via PIX (Asaas)"
    : "Saque processado via PIX Automático";

  await prisma.$transaction(async (tx) => {
    await tx.solicitacaoSaque.update({
      where: { id: saqueId },
      data: {
        status: "PROCESSADO",
        processadoEm: new Date(),
        observacao: observacaoSucesso,
      },
    });

    await tx.transacao.updateMany({
      where: { saqueId, tipo: "SAQUE" },
      data: { status: "PROCESSADO" },
    });

    const valorSaque = new Prisma.Decimal(saque.valor);
    await tx.saldo.update({
      where: { fotografoId: saque.fotografoId },
      data: {
        bloqueado: { decrement: valorSaque },
      },
    });
  });

  try {
    const { notifyWithdrawalProcessed } = await import(
      "@/actions/notifications"
    );
    await notifyWithdrawalProcessed({
      userId: saque.fotografo!.userId,
      value: Number(saque.valor),
      status: "APROVADO",
    });
  } catch (nErr) {
    console.error("Failed to send withdrawal approval notification:", nErr);
  }

  return { success: true };
}

/**
 * Reprocessa um saque que falhou (status FALHOU).
 * Rebloqueia o saldo e tenta enviar o PIX novamente.
 */
export async function retryPayoutForSaque(
  saqueId: string
): Promise<ProcessPayoutResult> {
  const saque = await prisma.solicitacaoSaque.findUnique({
    where: { id: saqueId },
    include: {
      fotografo: {
        select: { userId: true, username: true },
      },
    },
  });

  if (!saque) {
    return { success: false, error: "Saque não encontrado" };
  }

  if (saque.status !== "FALHOU") {
    return { success: false, error: "Apenas saques com falha podem ser reprocessados" };
  }

  if (!saque.chavePix) {
    return { success: false, error: "Chave PIX não cadastrada" };
  }

  const valorDecimal = new Prisma.Decimal(saque.valor);

  await prisma.$transaction(async (tx) => {
    const saldo = await tx.saldo.findUnique({
      where: { fotografoId: saque.fotografoId },
    });

    if (!saldo || saldo.disponivel.lessThan(valorDecimal)) {
      throw new Error("INSUFFICIENT_FUNDS");
    }

    await tx.saldo.update({
      where: { fotografoId: saque.fotografoId },
      data: {
        disponivel: { decrement: valorDecimal },
        bloqueado: { increment: valorDecimal },
      },
    });

    await tx.solicitacaoSaque.update({
      where: { id: saqueId },
      data: { status: "PENDENTE", observacao: null },
    });

    await tx.transacao.updateMany({
      where: { saqueId, tipo: "SAQUE" },
      data: { status: "PENDENTE" },
    });
  });

  return processPayoutForSaque(saqueId);
}
