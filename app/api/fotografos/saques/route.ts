import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/auth";
import { getConfigNumber, CONFIG_KEYS } from "@/lib/config";
import { processPayoutForSaque } from "@/lib/payouts";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = (await request.json()) as { valor?: number | string };
    const valor = body.valor;
    const userId = user.id;

    if (!valor) {
      return NextResponse.json(
        { error: "Valor é obrigatório" },
        { status: 400 }
      );
    }

    const valorDecimal = new Prisma.Decimal(valor);

    const minSaque = await getConfigNumber(CONFIG_KEYS.MIN_SAQUE);

    if (valorDecimal.lessThan(minSaque)) {
      return NextResponse.json(
        { error: `Valor mínimo para saque é R$ ${minSaque.toFixed(2)}` },
        { status: 400 }
      );
    }

    const fotografo = await prisma.fotografo.findUnique({
      where: { userId },
    });

    if (!fotografo) {
      return NextResponse.json(
        { error: "Fotógrafo não encontrado" },
        { status: 404 }
      );
    }

    if (!fotografo.chavePix) {
      return NextResponse.json(
        { error: "Cadastre uma chave PIX antes de solicitar saque" },
        { status: 400 }
      );
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

      const updatedSaldo = await tx.saldo.update({
        where: { fotografoId: fotografo.id },
        data: {
          disponivel: { decrement: valorDecimal },
          bloqueado: { increment: valorDecimal },
        },
      });

      if (updatedSaldo.disponivel.lessThan(0)) {
        throw new Error("INSUFFICIENT_FUNDS_ATOMIC");
      }

      const saque = await tx.solicitacaoSaque.create({
        data: {
          fotografoId: fotografo.id,
          valor: valorDecimal,
          chavePix,
          status: "PENDENTE",
        },
      });

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

    if (payoutResult.success) {
      return NextResponse.json({
        data: result,
        instant: true,
      });
    }

    return NextResponse.json(
      {
        error:
          payoutResult.error ||
          "Não foi possível enviar o PIX. O valor foi devolvido ao seu saldo.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error creating withdrawal:", error);

    const msg = error instanceof Error ? error.message : String(error);
    if (msg === "INSUFFICIENT_FUNDS" || msg === "INSUFFICIENT_FUNDS_ATOMIC") {
      return NextResponse.json(
        { error: "Saldo insuficiente" },
        { status: 400 }
      );
    }

    if (msg === "SALDO_NOT_FOUND") {
      return NextResponse.json(
        { error: "Você ainda não tem saldo" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao solicitar saque" },
      { status: 500 }
    );
  }
}
