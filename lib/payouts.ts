/**
 * Lógica de processamento de saques (PIX via Asaas).
 * Usado no fluxo automático e no retry manual do admin.
 */

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { sendPixTransfer, isAsaasConfigured } from "@/lib/asaas";

export interface ProcessPayoutResult {
  success: boolean;
  error?: string;
  /** Quando true, saque permanece PENDENTE para processamento manual pelo admin */
  manualRequired?: boolean;
}

/**
 * Processa um saque pendente: envia PIX via Asaas.
 * - Sucesso: saque fica PENDENTE até o webhook de autorização APPROVED (depois PROCESSADO).
 * - Falha: status FALHOU, reverte saldo (bloqueado → disponivel).
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

  if (!isAsaasConfigured()) {
    return {
      success: false,
      error:
        "Saques por PIX não estão disponíveis no momento. Configure o Asaas para habilitar saques automáticos.",
    };
  }

  const asaasResult = await sendPixTransfer({
    value: Number(saque.valor),
    pixAddressKey: saque.chavePix,
    pixAddressKeyType: "CPF", // App atualmente cadastra apenas CPF
    description: `Saque GT Clicks - ${saque.id}`,
  });

  const payoutResult = {
    success: asaasResult.success,
    error: asaasResult.error,
    asaasTransferCreated: asaasResult.success,
  };

  if (!payoutResult.success) {
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

  // Asaas criou a transferência; o saque fica PENDENTE até o webhook de autorização
  // retornar APPROVED (markSaqueAsProcessedAfterTransferApproved).
  return { success: true };
}

/**
 * Chamado pelo webhook de autorização do Asaas quando retornamos APPROVED.
 * Marca o saque como PROCESSADO e debita o bloqueado (PIX foi autorizado).
 */
export async function markSaqueAsProcessedAfterTransferApproved(
  saqueId: string
): Promise<boolean> {
  const saque = await prisma.solicitacaoSaque.findUnique({
    where: { id: saqueId },
    include: {
      fotografo: { select: { userId: true } },
    },
  });

  if (!saque || saque.status !== "PENDENTE") {
    return false;
  }

  await prisma.$transaction(async (tx) => {
    await tx.solicitacaoSaque.update({
      where: { id: saqueId },
      data: {
        status: "PROCESSADO",
        processadoEm: new Date(),
        observacao: "Saque processado via PIX (Asaas)",
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

  return true;
}

/**
 * Quando o Asaas recusa a transferência (webhook de autorização retorna REFUSED),
 * marca o saque como FALHOU e devolve o valor ao fotógrafo (bloqueado → disponível).
 * Só tem efeito se o saque ainda estiver PENDENTE.
 */
export async function revertPendenteSaqueOnTransferRefused(
  saqueId: string,
  observacao: string
): Promise<void> {
  const saque = await prisma.solicitacaoSaque.findUnique({
    where: { id: saqueId },
    include: {
      fotografo: { select: { userId: true } },
    },
  });

  if (!saque || saque.status !== "PENDENTE") {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.solicitacaoSaque.update({
      where: { id: saqueId },
      data: {
        status: "FALHOU",
        processadoEm: new Date(),
        observacao,
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
