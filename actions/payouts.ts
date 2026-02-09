"use server";

/**
 * Server Actions para operações de Saque (Payouts)
 */

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getConfigNumber, CONFIG_KEYS } from "@/lib/config";
import { z } from "zod";
import { serializeDecimal, serializeModel } from "@/lib/serialization";
import { processPayoutForSaque } from "@/lib/payouts";

// --- Schemas ---

const withdrawalSchema = z.object({
  valor: z.number().positive("Valor deve ser positivo"),
});

// --- Actions ---

/**
 * Solicita um saque para o fotógrafo autenticado.
 * A chave PIX é obtida do perfil no servidor (nunca do client) por segurança.
 */
export async function requestWithdrawal(data: { valor: number }) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const validation = withdrawalSchema.safeParse(data);

  if (!validation.success) {
    return {
      error: "Dados inválidos",
      details: validation.error.flatten().fieldErrors,
    };
  }

  const { valor } = validation.data;

  const valorDecimal = new Prisma.Decimal(valor);
  const minSaque = await getConfigNumber(CONFIG_KEYS.MIN_SAQUE);

  if (valorDecimal.lessThan(minSaque)) {
    return { error: `Valor mínimo para saque é R$ ${minSaque.toFixed(2)}` };
  }

  try {
    const fotografo = await prisma.fotografo.findUnique({
      where: { userId: user.id },
    });

    if (!fotografo) {
      return { error: "Perfil de fotógrafo não encontrado" };
    }

    if (!fotografo.chavePix) {
      return { error: "Cadastre uma chave PIX antes de solicitar saque" };
    }

    const chavePix = fotografo.chavePix;

    const result = await prisma.$transaction(async (tx) => {
      const saldo = await tx.saldo.findUnique({
        where: { fotografoId: fotografo.id },
      });

      if (!saldo) {
        throw new Error("SALDO_NOT_FOUND");
      }

      if (saldo.disponivel.lessThan(valorDecimal)) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      // Move balance: available -> blocked (atomic)
      const updatedSaldo = await tx.saldo.update({
        where: { fotografoId: fotografo.id },
        data: {
          disponivel: { decrement: valorDecimal },
          bloqueado: { increment: valorDecimal },
        },
      });

      // Safety check for negative balance
      if (updatedSaldo.disponivel.lessThan(0)) {
        throw new Error("INSUFFICIENT_FUNDS_ATOMIC");
      }

      // Create withdrawal request
      const saque = await tx.solicitacaoSaque.create({
        data: {
          fotografoId: fotografo.id,
          valor: valorDecimal,
          chavePix,
          status: "PENDENTE",
        },
      });

      // Create transaction record
      await tx.transacao.create({
        data: {
          fotografoId: fotografo.id,
          tipo: "SAQUE",
          valor: valorDecimal.negated(),
          descricao: "Saque solicitado via PIX",
          saqueId: saque.id,
          status: "PENDENTE",
        },
      });

      return saque;
    });

    const payoutResult = await processPayoutForSaque(result.id);

    revalidatePath("/dashboard/fotografo/financeiro");

    if (payoutResult.success) {
      return {
        success: true,
        data: serializeModel(result),
        instant: !payoutResult.manualRequired,
        manualRequired: payoutResult.manualRequired,
        message: payoutResult.manualRequired
          ? "Saque solicitado! O processamento será feito em até 24h."
          : undefined,
      };
    }

    return {
      success: false,
      error:
        payoutResult.error ||
        "Não foi possível enviar o PIX. O valor foi devolvido ao seu saldo. Verifique sua chave PIX e tente novamente.",
    };
  } catch (error: any) {
    console.error("[requestWithdrawal] Error:", error.message);

    if (
      error.message === "INSUFFICIENT_FUNDS" ||
      error.message === "INSUFFICIENT_FUNDS_ATOMIC"
    ) {
      return { error: "Saldo insuficiente" };
    }

    if (error.message === "SALDO_NOT_FOUND") {
      return { error: "Você ainda não tem saldo" };
    }

    return { error: "Erro ao solicitar saque" };
  }
}

/**
 * Busca solicitações de saque do fotógrafo autenticado
 */
export async function getWithdrawals() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  try {
    const fotografo = await prisma.fotografo.findUnique({
      where: { userId: user.id },
    });

    if (!fotografo) {
      return { error: "Perfil de fotógrafo não encontrado" };
    }

    const saques = await prisma.solicitacaoSaque.findMany({
      where: { fotografoId: fotografo.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return {
      success: true,
      data: saques.map((s) => ({
        ...serializeModel(s),
        valor: serializeDecimal(s.valor),
      })),
    };
  } catch (error: any) {
    console.error("[getWithdrawals] Error:", error.message);
    return { error: "Erro ao buscar solicitações de saque" };
  }
}
