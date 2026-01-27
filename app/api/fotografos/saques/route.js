import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/auth";
import { getConfigNumber, CONFIG_KEYS } from "@/lib/config";

export async function POST(request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { valor, chavePix } = body;
    const userId = user.id;

    if (!valor || !chavePix) {
      return NextResponse.json(
        { error: "Valor e chavePix são obrigatórios" },
        { status: 400 },
      );
    }

    const valorDecimal = new Prisma.Decimal(valor);

    const minSaque = await getConfigNumber(CONFIG_KEYS.MIN_SAQUE);

    if (valorDecimal.lessThan(minSaque)) {
      return NextResponse.json(
        { error: `Valor mínimo para saque é R$ ${minSaque.toFixed(2)}` },
        { status: 400 },
      );
    }

    // Get photographer (initial check)
    const fotografo = await prisma.fotografo.findUnique({
      where: { userId },
    });

    if (!fotografo) {
      return NextResponse.json(
        { error: "Fotógrafo não encontrado" },
        { status: 404 },
      );
    }

    // --- SECURITY FIX: Transaction + Decimal Precision ---
    const result = await prisma.$transaction(async (tx) => {
      // Lock balance row (implicit lock via update or explicit read)
      // Prisma doesn't support 'FOR UPDATE' easily without raw query, so we rely on atomic updates
      // But first we need to check if enough balance exists.

      const saldo = await tx.saldo.findUnique({
        where: { fotografoId: fotografo.id },
      });

      if (!saldo) {
        throw new Error("SALDO_NOT_FOUND");
      }

      if (saldo.disponivel.lessThan(valorDecimal)) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      // 1. Move balance: available -> blocked (Atomic decrement ensures race safety)
      // If another transaction decrements first, this one will fail? No, wait.
      // The check above (lessThan) is NOT atomic if separate from update.
      // However, the `update` below with decrement IS atomic relative to the DB state.
      // Safer approach: Optimistic check, then Atomic decrement. If DB returns error (check constraint constraint violation for negative), handle it.
      // But Prisma/Postgres handles the decrement concurrently.
      // To be extra safe against "check then act" gap:
      // Rely on the fact that if we decrement and it goes negative (if there was a constraint), it would fail.
      // But here we don't have a check constraint on DB level for non-negative balance (we should adds one in migration in future).

      // Correct pattern inside transaction:
      // The `findUnique` inside `tx` reads snapshot. If another tx committed, we see new data (REPEATABLE READ default in many, but depend on isolation).
      // To be strictly safe without FOR UPDATE: rely on atomic update return or constraint.

      // Let's optimize: Update the balance first.
      const updatedSaldo = await tx.saldo.update({
        where: { fotografoId: fotografo.id },
        data: {
          disponivel: { decrement: valorDecimal },
          bloqueado: { increment: valorDecimal },
        },
      });

      // Check if we went negative (if no DB constraint exists yet)
      if (updatedSaldo.disponivel.lessThan(0)) {
        throw new Error("INSUFFICIENT_FUNDS_ATOMIC");
      }

      // 2. Create withdrawal request
      const saque = await tx.solicitacaoSaque.create({
        data: {
          fotografoId: fotografo.id,
          valor: valorDecimal,
          chavePix,
          status: "PENDENTE",
        },
      });

      // 3. Create transaction record
      await tx.transacao.create({
        data: {
          fotografoId: fotografo.id,
          tipo: "SAQUE",
          valor: valorDecimal.negated(), // stored as negative for history
          descricao: `Saque solicitado via PIX`,
          saqueId: saque.id,
          status: "PENDENTE",
        },
      });

      return saque;
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Error creating withdrawal:", error);

    if (
      error.message === "INSUFFICIENT_FUNDS" ||
      error.message === "INSUFFICIENT_FUNDS_ATOMIC"
    ) {
      return NextResponse.json(
        { error: "Saldo insuficiente" },
        { status: 400 },
      );
    }

    if (error.message === "SALDO_NOT_FOUND") {
      return NextResponse.json(
        { error: "Você ainda não tem saldo" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Erro ao solicitar saque" },
      { status: 500 },
    );
  }
}
