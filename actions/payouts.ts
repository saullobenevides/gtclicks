"use server";

/**
 * Server Actions para operações de Saque (Payouts)
 */

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getConfigNumber, CONFIG_KEYS } from "@/lib/config";

/**
 * Solicita um saque para o fotógrafo autenticado
 */
export async function requestWithdrawal(data: {
  valor: number;
  chavePix: string;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const { valor, chavePix } = data;

  if (!valor || !chavePix) {
    return { error: "Valor e chave PIX são obrigatórios" };
  }

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

    revalidatePath("/dashboard/fotografo/financeiro");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[Action] requestWithdrawal error:", error);

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
        ...s,
        valor: Number(s.valor),
      })),
    };
  } catch (error: any) {
    console.error("[Action] getWithdrawals error:", error);
    return { error: "Erro ao buscar solicitações de saque" };
  }
}
